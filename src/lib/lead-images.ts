import { supabase } from './supabase';
import { uploadFile, createThumbnail, deleteFile, STORAGE_BUCKETS, ALLOWED_IMAGE_TYPES, validateFileType } from './storage';
import type { Database } from '../types/database';

type LeadImage = Database['public']['Tables']['lead_images']['Row'];
type LeadImageInsert = Database['public']['Tables']['lead_images']['Insert'];

export interface UploadLeadImageOptions {
  file: File;
  leadId: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface LeadImageResult {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isLocalStorage: boolean;
}

export async function uploadLeadImage({
  file,
  leadId,
  caption,
  isPrimary = false,
}: UploadLeadImageOptions): Promise<LeadImageResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
  }

  const lead = await supabase
    .from('leads')
    .select('id, user_id')
    .eq('id', leadId)
    .maybeSingle();

  if (!lead.data || lead.data.user_id !== user.id) {
    throw new Error('Lead not found or access denied');
  }

  let thumbnailUrl: string | undefined;
  try {
    const thumbnail = await createThumbnail(file, 300);
    const thumbnailPath = `${user.id}/thumbnails/${Date.now()}-thumb-${file.name}`;
    const thumbnailResult = await uploadFile({
      bucket: STORAGE_BUCKETS.LEAD_IMAGES,
      file: thumbnail,
      path: thumbnailPath,
    });
    thumbnailUrl = thumbnailResult.url;
  } catch (error) {
    console.warn('Failed to create thumbnail:', error);
  }

  const uploadResult = await uploadFile({
    bucket: STORAGE_BUCKETS.LEAD_IMAGES,
    file,
  });

  const { data: imageData, error: insertError } = await supabase
    .from('lead_images')
    .insert({
      lead_id: leadId,
      image_url: uploadResult.url,
      is_local_storage: true,
      file_size: file.size,
      mime_type: file.type,
      thumbnail_url: thumbnailUrl,
      caption,
      is_primary: isPrimary,
    })
    .select()
    .single();

  if (insertError) {
    await deleteFile(STORAGE_BUCKETS.LEAD_IMAGES, uploadResult.path);
    throw new Error(`Failed to save image metadata: ${insertError.message}`);
  }

  return {
    id: imageData.id,
    imageUrl: imageData.image_url,
    thumbnailUrl: imageData.thumbnail_url || undefined,
    isLocalStorage: true,
  };
}

export async function addExternalLeadImage(
  leadId: string,
  imageUrl: string,
  options?: { caption?: string; isPrimary?: boolean }
): Promise<LeadImageResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const lead = await supabase
    .from('leads')
    .select('id, user_id')
    .eq('id', leadId)
    .maybeSingle();

  if (!lead.data || lead.data.user_id !== user.id) {
    throw new Error('Lead not found or access denied');
  }

  const { data: imageData, error } = await supabase
    .from('lead_images')
    .insert({
      lead_id: leadId,
      image_url: imageUrl,
      is_local_storage: false,
      caption: options?.caption,
      is_primary: options?.isPrimary || false,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: imageData.id,
    imageUrl: imageData.image_url,
    isLocalStorage: false,
  };
}

export async function deleteLeadImage(imageId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: image, error: fetchError } = await supabase
    .from('lead_images')
    .select('*, leads!inner(user_id)')
    .eq('id', imageId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!image) throw new Error('Image not found');

  if (image.leads.user_id !== user.id) {
    throw new Error('Access denied');
  }

  if (image.is_local_storage) {
    const filePath = image.image_url.split('/').slice(-2).join('/');
    try {
      await deleteFile(STORAGE_BUCKETS.LEAD_IMAGES, filePath);
    } catch (error) {
      console.error('Failed to delete file from storage:', error);
    }

    if (image.thumbnail_url) {
      const thumbnailPath = image.thumbnail_url.split('/').slice(-2).join('/');
      try {
        await deleteFile(STORAGE_BUCKETS.LEAD_IMAGES, thumbnailPath);
      } catch (error) {
        console.error('Failed to delete thumbnail from storage:', error);
      }
    }
  }

  const { error: deleteError } = await supabase
    .from('lead_images')
    .delete()
    .eq('id', imageId);

  if (deleteError) throw deleteError;
}

export async function getLeadImages(leadId: string): Promise<LeadImage[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('lead_images')
    .select('*, leads!inner(user_id)')
    .eq('lead_id', leadId)
    .eq('leads.user_id', user.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function setPrimaryLeadImage(leadId: string, imageId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const lead = await supabase
    .from('leads')
    .select('id, user_id')
    .eq('id', leadId)
    .maybeSingle();

  if (!lead.data || lead.data.user_id !== user.id) {
    throw new Error('Lead not found or access denied');
  }

  await supabase
    .from('lead_images')
    .update({ is_primary: false })
    .eq('lead_id', leadId);

  const { error } = await supabase
    .from('lead_images')
    .update({ is_primary: true })
    .eq('id', imageId)
    .eq('lead_id', leadId);

  if (error) throw error;
}

export async function bulkUploadLeadImages(
  leadId: string,
  files: File[]
): Promise<{ success: LeadImageResult[]; failed: Array<{ file: string; error: string }> }> {
  const success: LeadImageResult[] = [];
  const failed: Array<{ file: string; error: string }> = [];

  for (const file of files) {
    try {
      const result = await uploadLeadImage({
        file,
        leadId,
        isPrimary: success.length === 0,
      });
      success.push(result);
    } catch (error) {
      failed.push({
        file: file.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { success, failed };
}
