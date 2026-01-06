import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  currentImage?: string | null;
  onImageSelect: (file: File) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onImageRemove?: () => void;
  maxSize?: number;
  shape?: 'square' | 'circle' | 'rectangle';
  aspectRatio?: number;
  disabled?: boolean;
  className?: string;
}

export default function ImageUploader({
  currentImage,
  onImageSelect,
  onImageUpload,
  onImageRemove,
  maxSize = 5 * 1024 * 1024,
  shape = 'square',
  aspectRatio = 1,
  disabled = false,
  className = '',
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateImage = (file: File): boolean => {
    setError(null);

    if (file.size > maxSize) {
      setError(`Image is too large. Maximum size is ${formatBytes(maxSize)}`);
      return false;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return false;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG, WebP, and GIF images are supported');
      return false;
    }

    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateImage(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);

    if (onImageUpload) {
      setUploading(true);
      setError(null);
      try {
        const url = await onImageUpload(file);
        setPreview(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setPreview(currentImage || null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    if (onImageRemove) onImageRemove();
  };

  const shapeClasses = {
    square: 'rounded-lg',
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
  };

  const containerSizeClasses = {
    square: 'w-40 h-40',
    circle: 'w-40 h-40',
    rectangle: 'w-full h-48',
  };

  return (
    <div className={className}>
      <div
        className={`relative ${containerSizeClasses[shape]} ${shapeClasses[shape]} border-2 border-dashed transition-colors overflow-hidden ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleChange}
          disabled={disabled || uploading}
        />

        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && !uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      inputRef.current?.click();
                    }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Change image"
                  >
                    <Camera className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : dragActive ? (
              <>
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-xs font-medium">Drop image here</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 mb-2" />
                <p className="text-xs font-medium">Upload Image</p>
                <p className="text-xs mt-1 px-2 text-center">
                  Click or drag
                </p>
              </>
            )}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      <p className="mt-2 text-xs text-gray-500 text-center">
        Max {formatBytes(maxSize)} · JPG, PNG, WebP, GIF
      </p>
    </div>
  );
}
