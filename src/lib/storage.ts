import { supabase } from './supabase';
import type { Database } from '../types/database';

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  COMPANY_LOGOS: 'company-logos',
  LEAD_IMAGES: 'lead-images',
  EMAIL_ATTACHMENTS: 'email-attachments',
  EXPORTS: 'exports',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

export const BUCKET_LIMITS = {
  [STORAGE_BUCKETS.AVATARS]: 5 * 1024 * 1024,
  [STORAGE_BUCKETS.COMPANY_LOGOS]: 5 * 1024 * 1024,
  [STORAGE_BUCKETS.LEAD_IMAGES]: 10 * 1024 * 1024,
  [STORAGE_BUCKETS.EMAIL_ATTACHMENTS]: 25 * 1024 * 1024,
  [STORAGE_BUCKETS.EXPORTS]: 100 * 1024 * 1024,
} as const;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

export interface UploadOptions {
  bucket: StorageBucket;
  file: File;
  path?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  path: string;
  url: string;
  fullPath: string;
}

export interface StorageQuota {
  used: number;
  limit: number;
  percentage: number;
  hasSpace: boolean;
}

export async function checkStorageQuota(): Promise<StorageQuota> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('storage_used_bytes')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('storage_limit_bytes')
    .eq('user_id', user.id)
    .maybeSingle();

  const used = profile?.storage_used_bytes || 0;
  const limit = subscription?.storage_limit_bytes || 1073741824;
  const percentage = (used / limit) * 100;

  return {
    used,
    limit,
    percentage,
    hasSpace: used < limit,
  };
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

export async function uploadFile({ bucket, file, path, onProgress }: UploadOptions): Promise<UploadResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let allowedTypes: string[] = [];
  if (bucket === STORAGE_BUCKETS.AVATARS || bucket === STORAGE_BUCKETS.COMPANY_LOGOS || bucket === STORAGE_BUCKETS.LEAD_IMAGES) {
    allowedTypes = ALLOWED_IMAGE_TYPES;
  } else if (bucket === STORAGE_BUCKETS.EMAIL_ATTACHMENTS) {
    allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  } else if (bucket === STORAGE_BUCKETS.EXPORTS) {
    allowedTypes = ['text/csv', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  }

  if (!validateFileType(file, allowedTypes)) {
    throw new Error(`File type ${file.type} is not allowed for this bucket. Allowed types: ${allowedTypes.join(', ')}`);
  }

  const bucketLimit = BUCKET_LIMITS[bucket];
  if (!validateFileSize(file, bucketLimit)) {
    throw new Error(`File size exceeds limit of ${formatBytes(bucketLimit)}`);
  }

  const quota = await checkStorageQuota();
  if (!quota.hasSpace || (quota.used + file.size) > quota.limit) {
    throw new Error(`Storage quota exceeded. Used ${formatBytes(quota.used)} of ${formatBytes(quota.limit)}`);
  }

  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileExt = sanitizedFilename.split('.').pop() || '';
  const fileName = path || `${user.id}/${Date.now()}-${sanitizedFilename}`;

  if (!fileName.startsWith(`${user.id}/`)) {
    throw new Error('Invalid file path: files must be uploaded to your user folder');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    if (error.message.includes('already exists')) {
      throw new Error('A file with this name already exists. Please rename the file and try again.');
    }
    if (error.message.includes('payload too large')) {
      throw new Error(`File size exceeds the maximum allowed size of ${formatBytes(bucketLimit)}`);
    }
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  const { error: dbError } = await supabase.from('file_uploads').insert({
    user_id: user.id,
    file_path: data.path,
    bucket_name: bucket,
    file_size: file.size,
    mime_type: file.type,
    original_filename: file.name,
  });

  if (dbError) {
    await supabase.storage.from(bucket).remove([data.path]);
    throw new Error('Failed to record file upload. Please try again.');
  }

  return {
    path: data.path,
    url: publicUrl,
    fullPath: data.fullPath,
  };
}

export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error: storageError } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (storageError) throw storageError;

  await supabase
    .from('file_uploads')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('file_path', path)
    .eq('bucket_name', bucket);
}

export async function getSignedUrl(bucket: StorageBucket, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not compress image'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Could not load image'));
    };
    reader.onerror = () => reject(new Error('Could not read file'));
  });
}

export function createThumbnail(file: File, size = 200): Promise<File> {
  return compressImage(file, size, 0.7);
}

export async function cleanupOrphanedFiles(): Promise<{ deleted: number; errors: string[] }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: fileRecords, error: fetchError } = await supabase
    .from('file_uploads')
    .select('id, file_path, bucket_name, uploaded_at')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('uploaded_at', { ascending: true });

  if (fetchError) throw fetchError;

  let deletedCount = 0;
  const errors: string[] = [];

  for (const record of fileRecords || []) {
    const { data: exists } = await supabase.storage
      .from(record.bucket_name)
      .list(record.file_path.split('/')[0], {
        search: record.file_path.split('/').pop() || '',
      });

    if (!exists || exists.length === 0) {
      const { error: deleteError } = await supabase
        .from('file_uploads')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', record.id);

      if (deleteError) {
        errors.push(`Failed to mark ${record.file_path} as deleted: ${deleteError.message}`);
      } else {
        deletedCount++;
      }
    }
  }

  return { deleted: deletedCount, errors };
}

export async function getFilesByBucket(bucket: StorageBucket): Promise<Array<{
  id: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  original_filename: string;
  uploaded_at: string;
}>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('file_uploads')
    .select('id, file_path, file_size, mime_type, original_filename, uploaded_at')
    .eq('user_id', user.id)
    .eq('bucket_name', bucket)
    .is('deleted_at', null)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

const uploadRateLimiter = new Map<string, { count: number; resetAt: number }>();

export function checkUploadRateLimit(userId: string, maxUploads = 50, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = uploadRateLimiter.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    uploadRateLimiter.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxUploads) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function bulkDeleteFiles(bucket: StorageBucket, paths: string[]): Promise<{ success: number; failed: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const userPaths = paths.filter(p => p.startsWith(`${user.id}/`));

  if (userPaths.length !== paths.length) {
    throw new Error('Cannot delete files that do not belong to you');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(userPaths);

  if (error) throw error;

  const deletedPaths = data.map(d => d.name);

  await supabase
    .from('file_uploads')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .in('file_path', deletedPaths)
    .eq('bucket_name', bucket);

  return {
    success: deletedPaths.length,
    failed: paths.length - deletedPaths.length,
  };
}
