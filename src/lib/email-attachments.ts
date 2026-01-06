import { supabase } from './supabase';
import {
  uploadFile,
  deleteFile,
  getSignedUrl,
  STORAGE_BUCKETS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  validateFileType,
  formatBytes,
} from './storage';

export interface EmailAttachment {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface UploadAttachmentOptions {
  file: File;
  campaignId?: string;
  variantId?: string;
}

export interface AttachmentUploadResult {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

export async function uploadEmailAttachment({
  file,
  campaignId,
  variantId,
}: UploadAttachmentOptions): Promise<AttachmentUploadResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (!validateFileType(file, ALLOWED_ATTACHMENT_TYPES)) {
    throw new Error(
      `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_ATTACHMENT_TYPES.join(', ')}`
    );
  }

  if (file.size > MAX_ATTACHMENT_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${formatBytes(MAX_ATTACHMENT_SIZE)}`);
  }

  const uploadResult = await uploadFile({
    bucket: STORAGE_BUCKETS.EMAIL_ATTACHMENTS,
    file,
  });

  const attachmentData: {
    user_id: string;
    file_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    campaign_id?: string;
    variant_id?: string;
  } = {
    user_id: user.id,
    file_path: uploadResult.path,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
  };

  if (campaignId) attachmentData.campaign_id = campaignId;
  if (variantId) attachmentData.variant_id = variantId;

  const { data, error } = await supabase
    .from('email_attachments')
    .insert(attachmentData)
    .select()
    .single();

  if (error) {
    await deleteFile(STORAGE_BUCKETS.EMAIL_ATTACHMENTS, uploadResult.path);
    throw new Error(`Failed to save attachment metadata: ${error.message}`);
  }

  return {
    id: data.id,
    url: uploadResult.url,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}

export async function deleteEmailAttachment(attachmentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: attachment, error: fetchError } = await supabase
    .from('email_attachments')
    .select('file_path, user_id')
    .eq('id', attachmentId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!attachment) throw new Error('Attachment not found');

  if (attachment.user_id !== user.id) {
    throw new Error('Access denied');
  }

  try {
    await deleteFile(STORAGE_BUCKETS.EMAIL_ATTACHMENTS, attachment.file_path);
  } catch (error) {
    console.error('Failed to delete file from storage:', error);
  }

  const { error: deleteError } = await supabase
    .from('email_attachments')
    .delete()
    .eq('id', attachmentId);

  if (deleteError) throw deleteError;
}

export async function getEmailAttachments(options?: {
  campaignId?: string;
  variantId?: string;
}): Promise<EmailAttachment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('email_attachments')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false });

  if (options?.campaignId) {
    query = query.eq('campaign_id', options.campaignId);
  }

  if (options?.variantId) {
    query = query.eq('variant_id', options.variantId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((attachment) => ({
    id: attachment.id,
    fileName: attachment.file_name,
    filePath: attachment.file_path,
    fileSize: attachment.file_size,
    mimeType: attachment.mime_type,
    url: attachment.file_path,
    uploadedAt: attachment.uploaded_at,
  }));
}

export async function getAttachmentSignedUrl(
  attachmentId: string,
  expiresIn = 3600
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: attachment, error: fetchError } = await supabase
    .from('email_attachments')
    .select('file_path, user_id')
    .eq('id', attachmentId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!attachment) throw new Error('Attachment not found');

  if (attachment.user_id !== user.id) {
    throw new Error('Access denied');
  }

  return await getSignedUrl(STORAGE_BUCKETS.EMAIL_ATTACHMENTS, attachment.file_path, expiresIn);
}

export async function bulkUploadAttachments(
  files: File[],
  options?: { campaignId?: string; variantId?: string }
): Promise<{
  success: AttachmentUploadResult[];
  failed: Array<{ file: string; error: string }>;
}> {
  const success: AttachmentUploadResult[] = [];
  const failed: Array<{ file: string; error: string }> = [];

  for (const file of files) {
    try {
      const result = await uploadEmailAttachment({
        file,
        campaignId: options?.campaignId,
        variantId: options?.variantId,
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

export async function attachFilesToVariant(
  variantId: string,
  attachmentIds: string[]
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('email_attachments')
    .update({ variant_id: variantId })
    .eq('user_id', user.id)
    .in('id', attachmentIds);

  if (error) throw error;
}

export async function detachFilesFromVariant(attachmentIds: string[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('email_attachments')
    .update({ variant_id: null })
    .eq('user_id', user.id)
    .in('id', attachmentIds);

  if (error) throw error;
}

export function getAttachmentIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return '📝';
  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
    return '📊';
  if (mimeType === 'text/csv') return '📊';
  return '📎';
}
