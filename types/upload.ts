export interface PreviewMedia {
  file: File;
  compressedFile?: File;
  url: string;
  id: string;
  caption: string;
  type: 'image' | 'video';
  error?: string;
  validationErrors?: string[];
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface Category {
  id: string | number;
  category_name: string;
}

export interface UploadFormData {
  categoryId: string;
  categoryName: string;
  userId: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface UploadResponse {
  success?: boolean;
  error?: string;
  message?: string;
  data?: any;
}