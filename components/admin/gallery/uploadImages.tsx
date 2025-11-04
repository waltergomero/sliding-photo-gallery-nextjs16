'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import heic2any from 'heic2any';
import { XMarkIcon, ArrowUpTrayIcon, PhotoIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Compressor from 'compressorjs';
import { fetchCategories } from "@/actions/category-actions";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { toast } from 'react-toastify';
import { useFileValidation } from '@/hooks/useFileValidation';
import { useUploadProgress } from '@/hooks/useUploadProgress';
import type { PreviewMedia, Category, ValidationError } from '@/types/upload';

const UploadImages = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [selectedMedia, setSelectedMedia] = useState<PreviewMedia[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalErrors, setGlobalErrors] = useState<ValidationError[]>([]);

  // Custom hooks
  const { validateFile, validateFiles, validateCaption, validateUploadLimits } = useFileValidation();
  const { uploadProgress, updateProgress, setError, setCompleted, resetProgress, initializeProgress, getOverallProgress } = useUploadProgress();

  // Utility functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  // Image compression function
  const compressImage = useCallback((file: File): Promise<File> => {
    return new Promise((resolve) => {
      new Compressor(file, {
        quality: 0.95,
        maxWidth: 2016,
        maxHeight: 1512,
        success: (compressedFile) => resolve(compressedFile as File),
        error: (error) => {
          console.error('Compression error:', error);
          resolve(file); // Return original file if compression fails
        }
      });
    });
  }, []);

  // HEIC to JPEG conversion
  const convertHeicToJpeg = useCallback(async (file: File): Promise<File> => {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.99
      });
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
    } catch (error) {
      console.error('HEIC conversion failed:', error);
      throw error;
    }
  }, []);

  // File processing function
  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;

    setGlobalErrors([]);
    const fileArray = Array.from(files);
    
    // Validate files first
    const { valid, errors } = validateFiles(fileArray);
    if (!valid) {
      setGlobalErrors(errors);
      return;
    }

    // Check upload limits
    const limitErrors = validateUploadLimits(selectedMedia, fileArray);
    if (limitErrors.length > 0) {
      setGlobalErrors(limitErrors);
      return;
    }

    setIsProcessing(true);

    try {
      const newMedia: PreviewMedia[] = [];

      for (const file of fileArray) {
        let processedFile = file;
        
        // Convert HEIC files
        if (file.name.toLowerCase().endsWith('.heic')) {
          try {
            processedFile = await convertHeicToJpeg(file);
          } catch (error) {
            console.error('HEIC conversion failed for', file.name, error);
            newMedia.push({
              file,
              url: '',
              id: generateId(),
              caption: '',
              type: 'image',
              error: 'Failed to convert HEIC file'
            });
            continue;
          }
        }

        // Process based on file type
        if (processedFile.type.startsWith('image/')) {
          try {
            const compressedFile = await compressImage(processedFile);
            newMedia.push({
              file: processedFile,
              compressedFile,
              url: URL.createObjectURL(compressedFile),
              id: generateId(),
              caption: '',
              type: 'image',
            });
          } catch (error) {
            console.error('Image processing failed:', error);
            newMedia.push({
              file: processedFile,
              url: URL.createObjectURL(processedFile),
              id: generateId(),
              caption: '',
              type: 'image',
              error: 'Image processing failed'
            });
          }
        } else if (processedFile.type.startsWith('video/')) {
          newMedia.push({
            file: processedFile,
            url: URL.createObjectURL(processedFile),
            id: generateId(),
            caption: '',
            type: 'video',
          });
        }
      }

      if (newMedia.length > 0) {
        setSelectedMedia(prev => [...prev, ...newMedia]);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing files');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedMedia, validateFiles, validateUploadLimits, compressImage, convertHeicToJpeg]);

  // Event handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    await processFiles(e.dataTransfer.files);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const text = e.target.options[e.target.selectedIndex]?.text;
    
    if (value && text) {
      setSelectedCategory({ id: value, name: text });
    } else {
      setSelectedCategory(null);
    }
    setGlobalErrors([]);
  };

  const removeMedia = useCallback((id: string) => {
    setSelectedMedia(prev => {
      const mediaToRemove = prev.find(m => m.id === id);
      if (mediaToRemove?.url) {
        URL.revokeObjectURL(mediaToRemove.url);
      }
      return prev.filter(m => m.id !== id);
    });
  }, []);

  const updateCaption = useCallback((id: string, caption: string) => {
    // Validate caption
    const captionErrors = validateCaption(caption);
    
    setSelectedMedia(prev =>
      prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            caption,
            validationErrors: captionErrors.length > 0 ? captionErrors.map(e => e.message) : undefined
          };
        }
        return m;
      })
    );
  }, [validateCaption]);

  const clearAllMedia = useCallback(() => {
    selectedMedia.forEach(m => {
      if (m.url) URL.revokeObjectURL(m.url);
    });
    setSelectedMedia([]);
    resetProgress();
    setGlobalErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedMedia, resetProgress]);

  const handleUpload = async () => {
    if (selectedMedia.length === 0) {
      toast.error("Please select files to upload");
      return;
    }
    
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    if (!userId) {
      toast.error("User session expired. Please log in again");
      return;
    }

    setIsUploading(true);
    setGlobalErrors([]);

    // Initialize upload progress
    const fileIds = selectedMedia.map(m => m.id);
    initializeProgress(fileIds);

    try {
      const API_PATH = "/api/admin/gallery/";
      let successCount = 0;
      let errorCount = 0;

      for (const media of selectedMedia) {
        try {
          updateProgress(media.id, 0, 'uploading');

          const extension = media.file.name.split('.').pop() || '';
          const formData = new FormData();

          // Add the appropriate file
          if (media.type === 'image' && media.compressedFile) {
            formData.append('image', media.compressedFile);
          } else if (media.type === 'video') {
            formData.append('video', media.file);
          } else {
            formData.append('image', media.file);
          }

          formData.append('extension', extension);
          formData.append('caption', media.caption || '');
          formData.append('categoryId', selectedCategory.id);
          formData.append('category_name', selectedCategory.name);
          formData.append('userId', userId);
          formData.append('type', media.type);

          const response = await fetch(API_PATH, {
            method: 'POST',
            body: formData
          });

          const data = await response.json();

          if (response.ok) {
            setCompleted(media.id);
            successCount++;
          } else {
            throw new Error(data.message || 'Upload failed');
          }
        } catch (error) {
          console.error(`Upload failed for ${media.file.name}:`, error);
          setError(media.id, error instanceof Error ? error.message : 'Upload failed');
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to upload ${errorCount} file${errorCount > 1 ? 's' : ''}`);
      }

      // If all uploads successful, navigate and clear
      if (errorCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        clearAllMedia();
        router.push(`/admin/gallery/category/${selectedCategory.name}`);
      }

    } catch (error) {
      console.error('Upload process failed:', error);
      toast.error('Upload process failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup URLs on unmount
  React.useEffect(() => {
    return () => {
      selectedMedia.forEach(m => URL.revokeObjectURL(m.url));
    };
  }, [selectedMedia]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      selectedMedia.forEach(m => {
        if (m.url) URL.revokeObjectURL(m.url);
      });
    };
  }, []);

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {/* Global Errors */}
              {globalErrors.length > 0 && (
                <div className="alert alert-danger" role="alert">
                  <div className="d-flex align-items-center mb-2">
                    <ExclamationTriangleIcon className="me-2" style={{ width: '20px', height: '20px' }} />
                    <strong>Please fix the following errors:</strong>
                  </div>
                  <ul className="mb-0">
                    {globalErrors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category Selection */}
              <div className="mb-3">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <label htmlFor="category" className="form-label mb-0">
                      Select Category <span className="text-danger">*</span>
                    </label>
                  </div>
                  <div className="col-4">
                    <select
                      id="category"
                      className={`form-select ${!selectedCategory && selectedMedia.length > 0 ? 'is-invalid' : ''}`}
                      onChange={handleCategoryChange}
                      value={selectedCategory?.id || ''}
                      style={{ maxWidth: '300px' }}
                    >
                      <option value="">Choose a category...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div className={`rounded p-4 text-center mb-2 ${
                  isDragOver 
                    ? 'border-primary bg-primary bg-opacity-10' 
                    : ''
                } ${isProcessing ? 'bg-light' : ''}`}
                style={{ 
                  minHeight: '200px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  border: isDragOver ? '2px solid var(--bs-primary)' : '2px dashed #dddddd'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
              >
                {/* <PhotoIcon className="mx-auto mb-3 text-muted" style={{ width: '48px', height: '48px' }} />
                 */}
                {isProcessing ? (
                  <div>
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5 className="text-primary mb-2">Processing files...</h5>
                    <p className="text-muted">Please wait while we process your files</p>
                  </div>
                ) : (
                  <div >
                    <h5 className="mb-2">Drop files here or click to browse</h5>
                    <p className="text-muted mb-2">
                      Supports: JPG, PNG, GIF, WebP, HEIC (images) • MP4, WebM, AVI (videos)
                    </p>
                    <p className="text-muted small mb-3">
                      Max file size: 10MB • Max 20 files • Max total: 100MB
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.heic"
                  onChange={handleFileSelect}
                  className="d-none"
                  disabled={isProcessing}
                />

                {!isProcessing && (
                  <button
                    type="button"
                    className="btn btn-primary d-inline-flex align-items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <ArrowUpTrayIcon className="me-2" style={{ width: '16px', height: '16px' }} />
                    Choose Files
                  </button>
                )}
              </div>

              {/* Media Preview Grid */}
              {selectedMedia.length > 0 && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">
                      Preview ({selectedMedia.length} file{selectedMedia.length !== 1 ? 's' : ''})
                      {selectedMedia.filter(m => m.caption.trim()).length > 0 && (
                        <small className="text-success ms-2">
                          ({selectedMedia.filter(m => m.caption.trim()).length} with captions)
                        </small>
                      )}
                    </h5>
                    <button
                      type="button"
                      onClick={clearAllMedia}
                      className="btn btn-outline-danger btn-sm"
                      disabled={isUploading}
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="row g-3 mb-4">
                    {selectedMedia.map((media) => (
                      <div key={media.id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                        <div className="card h-100">
                          <div className="position-relative">
                            <div
                              className="ratio ratio-1x1 bg-light"
                              style={{ overflow: 'hidden' }}
                            >
                              {media.error ? (
                                <div className="d-flex align-items-center justify-content-center">
                                  <div className="text-center text-danger">
                                    <ExclamationTriangleIcon style={{ width: '32px', height: '32px' }} />
                                    <div className="small mt-2">{media.error}</div>
                                  </div>
                                </div>
                              ) : media.type === 'image' ? (
                                <img
                                  src={media.url}
                                  alt={media.file.name}
                                  className="w-100 h-100"
                                  style={{ objectFit: 'cover' }}
                                />
                              ) : (
                                <video
                                  src={media.url}
                                  className="w-100 h-100"
                                  style={{ objectFit: 'cover' }}
                                  controls
                                />
                              )}
                            </div>
                            
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => removeMedia(media.id)}
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                              style={{ width: '32px', height: '32px', padding: '0' }}
                              disabled={isUploading}
                            >
                              <XMarkIcon style={{ width: '16px', height: '16px' }} />
                            </button>

                            {/* Upload progress */}
                            {isUploading && uploadProgress.find(p => p.fileId === media.id) && (
                              <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2">
                                <div className="progress" style={{ height: '4px' }}>
                                  <div 
                                    className="progress-bar" 
                                    style={{ width: `${uploadProgress.find(p => p.fileId === media.id)?.progress || 0}%` }}
                                  />
                                </div>
                                <small className="d-block mt-1">
                                  {uploadProgress.find(p => p.fileId === media.id)?.status}
                                </small>
                              </div>
                            )}
                          </div>

                          <div className="card-body p-1">
                            <textarea
                              className={`form-control form-control-sm ${
                                media.validationErrors ? 'is-invalid' : ''
                              }`}
                              placeholder="Add caption (optional)"
                              value={media.caption}
                              onChange={(e) => updateCaption(media.id, e.target.value)}
                              rows={3}
                              disabled={isUploading}
                              style={{ fontSize: '12px', resize: 'vertical' }}
                            />
                            {media.validationErrors && (
                              <div className="invalid-feedback">
                                {media.validationErrors.join(', ')}
                              </div>
                            )}
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <small className="text-muted text-truncate me-2">
                                {media.file.name}
                              </small>
                              <small className="text-muted">
                                {(media.file.size / 1024 / 1024).toFixed(1)}MB
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload Button */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={
                        isUploading || 
                        selectedMedia.length === 0 || 
                        !selectedCategory ||
                        selectedMedia.some(m => m.error) ||
                        isProcessing
                      }
                      className="btn btn-success btn-lg d-inline-flex align-items-center"
                    >
                      {isUploading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Uploading... ({getOverallProgress()}%)
                        </>
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="me-2" style={{ width: '20px', height: '20px' }} />
                          Upload {selectedMedia.length} File{selectedMedia.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadImages