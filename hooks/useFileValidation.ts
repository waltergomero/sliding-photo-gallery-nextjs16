import { useState, useCallback } from 'react';
import { fileValidationSchema, captionSchema } from '@/lib/schema-validators';
import { PreviewMedia, ValidationError } from '@/types/upload';

const MAX_FILES = 20;
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB total

interface UseFileValidationReturn {
  validateFile: (file: File) => ValidationError[];
  validateFiles: (files: File[]) => { valid: boolean; errors: ValidationError[] };
  validateCaption: (caption: string) => ValidationError[];
  validateUploadLimits: (existingFiles: PreviewMedia[], newFiles: File[]) => ValidationError[];
}

export const useFileValidation = (): UseFileValidationReturn => {
  const validateFile = useCallback((file: File): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    try {
      fileValidationSchema.parse({
        name: file.name,
        size: file.size,
        type: file.type,
      });
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          errors.push({
            field: 'file',
            message: err.message,
          });
        });
      }
    }

    // Additional validations
    if (file.name.length > 255) {
      errors.push({
        field: 'file',
        message: 'Filename is too long (max 255 characters)',
      });
    }

    // Check for potentially dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExtension)) {
      errors.push({
        field: 'file',
        message: 'File type not allowed for security reasons',
      });
    }

    return errors;
  }, []);

  const validateFiles = useCallback((files: File[]): { valid: boolean; errors: ValidationError[] } => {
    const allErrors: ValidationError[] = [];
    
    files.forEach((file, index) => {
      const fileErrors = validateFile(file);
      fileErrors.forEach(error => {
        allErrors.push({
          ...error,
          field: `file_${index}`,
          message: `File "${file.name}": ${error.message}`,
        });
      });
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  }, [validateFile]);

  const validateCaption = useCallback((caption: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    try {
      captionSchema.parse({ caption });
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          errors.push({
            field: 'caption',
            message: err.message,
          });
        });
      }
    }

    return errors;
  }, []);

  const validateUploadLimits = useCallback((existingFiles: PreviewMedia[], newFiles: File[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Check file count limit
    if (existingFiles.length + newFiles.length > MAX_FILES) {
      errors.push({
        field: 'files',
        message: `Cannot upload more than ${MAX_FILES} files at once`,
      });
    }

    // Check total size limit
    const existingSize = existingFiles.reduce((sum, file) => sum + file.file.size, 0);
    const newSize = newFiles.reduce((sum, file) => sum + file.size, 0);
    
    if (existingSize + newSize > MAX_TOTAL_SIZE) {
      const maxSizeMB = Math.round(MAX_TOTAL_SIZE / (1024 * 1024));
      errors.push({
        field: 'files',
        message: `Total file size cannot exceed ${maxSizeMB}MB`,
      });
    }

    return errors;
  }, []);

  return {
    validateFile,
    validateFiles,
    validateCaption,
    validateUploadLimits,
  };
};