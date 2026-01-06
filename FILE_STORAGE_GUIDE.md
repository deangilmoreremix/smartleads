# File Storage Implementation Guide

## Overview
This application now includes a comprehensive file storage system powered by Supabase Storage. Users can upload profile pictures, company logos, and other files with automatic quota management and security controls.

## Features Implemented

### 1. Database Schema
- **Profiles table** enhanced with:
  - `avatar_url` - User profile picture URL
  - `company_logo` - Company logo URL
  - `storage_used_bytes` - Total storage consumed by user

- **File Uploads table** (`file_uploads`) tracks:
  - File path and bucket name
  - File size and MIME type
  - Original filename
  - Upload timestamp
  - Deletion timestamp (soft deletes)

- **Subscriptions table** enhanced with:
  - `storage_limit_bytes` - Storage quota per plan
  - Free: 1 GB
  - Starter: 10 GB
  - Professional: 50 GB
  - Enterprise: Unlimited

### 2. Storage Buckets
Five storage buckets configured with specific purposes:

- **avatars** (public)
  - User profile pictures
  - 5 MB file size limit
  - Image formats only

- **company-logos** (public)
  - Business branding images
  - 5 MB file size limit
  - Image formats only

- **lead-images** (private)
  - Lead/prospect photos
  - 10 MB file size limit
  - Image formats only

- **email-attachments** (private)
  - Campaign file attachments
  - 25 MB file size limit
  - Images and documents

- **exports** (private)
  - Generated reports and data exports
  - 100 MB file size limit
  - CSV, PDF, XLSX formats

### 3. Components

#### ImageUploader
Full-featured image upload component with:
- Drag-and-drop support
- Image preview
- File validation
- Progress indication
- Shape options (circle, square, rectangle)
- Remove functionality

**Usage:**
```tsx
<ImageUploader
  currentImage={profile?.avatar_url}
  onImageSelect={(file) => console.log(file)}
  onImageUpload={handleAvatarUpload}
  onImageRemove={handleAvatarRemove}
  shape="circle"
  maxSize={5 * 1024 * 1024}
/>
```

#### FileUpload
General-purpose file upload component with:
- Multi-file support
- File type validation
- Size validation
- Drag-and-drop interface
- Upload progress tracking

**Usage:**
```tsx
<FileUpload
  accept="image/*"
  maxSize={10 * 1024 * 1024}
  multiple={true}
  onFileSelect={(files) => console.log(files)}
  onUpload={handleUpload}
/>
```

#### StorageQuotaDisplay
Shows user's storage usage with:
- Visual progress bar
- Usage percentage
- Color-coded warnings
- Upgrade prompts

### 4. Helper Functions

#### Storage Library (`src/lib/storage.ts`)

**Key Functions:**
- `uploadFile()` - Upload file with quota checking
- `deleteFile()` - Remove file and update tracking
- `checkStorageQuota()` - Get current usage and limits
- `formatBytes()` - Human-readable file sizes
- `compressImage()` - Optimize images before upload
- `validateFileType()` - Check file type against allowed list
- `getSignedUrl()` - Generate temporary access URLs

**Example:**
```typescript
import { uploadFile, STORAGE_BUCKETS } from '../lib/storage';

const result = await uploadFile({
  bucket: STORAGE_BUCKETS.AVATARS,
  file: selectedFile,
  path: `${userId}/avatar.jpg`,
  onProgress: (progress) => setProgress(progress),
});

console.log(result.url); // Public URL
```

### 5. Security Features

#### Row Level Security (RLS)
- All buckets protected with RLS policies
- Users can only access their own files
- Automatic user ID validation

#### Quota Management
- Automatic storage tracking via database triggers
- Quota checking before uploads
- Plan-based limits enforcement
- Visual warnings at 75% and 90% usage

#### File Validation
- MIME type checking
- File size limits
- Extension validation
- Client and server-side validation

## Setup Instructions

### 1. Initialize Storage Buckets
The storage buckets need to be created before file uploads will work. Run the setup function:

```bash
# Call the setup-storage edge function
curl -X POST \
  https://your-project.supabase.co/functions/v1/setup-storage \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Or create them manually in the Supabase Dashboard:
1. Go to Storage section
2. Create each bucket with the specifications above
3. Configure public/private access appropriately

### 2. Configure Storage Policies
The buckets are created with default policies, but you can customize them in the Supabase Dashboard under Storage > Policies.

**Default policies allow:**
- Authenticated users to upload to their own folders
- Public read access for avatars and logos
- Private access for all other buckets

## Integration Examples

### Profile Picture Upload
Already integrated in the Settings page:
1. User clicks on profile picture area
2. Selects an image file
3. File is validated and compressed
4. Upload to `avatars` bucket
5. Database updated with new URL
6. Storage quota automatically updated

### Adding File Upload to Other Pages
```tsx
import ImageUploader from '../components/ImageUploader';
import { uploadFile, STORAGE_BUCKETS } from '../lib/storage';

function MyPage() {
  const handleUpload = async (file: File) => {
    const result = await uploadFile({
      bucket: STORAGE_BUCKETS.LEAD_IMAGES,
      file,
    });
    return result.url;
  };

  return (
    <ImageUploader
      onImageUpload={handleUpload}
      maxSize={10 * 1024 * 1024}
    />
  );
}
```

## Automatic Features

### Storage Tracking
File uploads automatically:
- Create entry in `file_uploads` table
- Update user's `storage_used_bytes`
- Check quota before upload
- Prevent uploads when quota exceeded

### File Cleanup
When files are deleted:
- Removed from storage bucket
- Marked as deleted in database (soft delete)
- Storage quota automatically reduced
- User notified of successful deletion

## Troubleshooting

### Upload Fails
1. Check storage quota hasn't been exceeded
2. Verify file type is allowed for the bucket
3. Ensure file size is within bucket limits
4. Check user is authenticated

### Buckets Not Found
Run the setup-storage edge function to create all buckets automatically.

### Images Not Displaying
1. Verify bucket is set to public (for avatars/logos)
2. Check the URL is correctly saved in the database
3. Ensure CORS is configured in Supabase

## Future Enhancements

Potential additions:
- Image cropping before upload
- Automatic thumbnail generation
- Bulk file uploads
- File organization (folders/tags)
- Advanced search and filtering
- CDN integration for faster delivery
- Automatic cleanup of old files
- Webhook notifications for file events
