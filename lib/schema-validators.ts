import { z } from 'zod';

export const userSigninSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 8 characters long' }),
});


export const userSignupSchema = z.object({
  first_name: z.string().min(2, { message: 'First name must be at least 2 characters long' }),
  last_name: z.string().min(2, { message: 'Last name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export const userUpdateSchema = z.object({
  first_name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  last_name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
});

  export const categorySchema = z.object({
  category_name: z.string().min(2, { message: 'Category name must be at least 2 characters long' }),
});

  export const statusSchema = z.object({
  status_name: z.string().min(2, { message: 'Status name must be at least 2 characters long' }),
});

// Upload validation schemas
export const uploadFormSchema = z.object({
  categoryId: z.string().min(1, { message: 'Please select a category' }),
  files: z.array(z.any()).min(1, { message: 'Please select at least one file' }),
});

export const fileValidationSchema = z.object({
  name: z.string(),
  size: z.number().max(10 * 1024 * 1024, { message: 'File size must be less than 10MB' }),
  type: z.string().refine(
    (type) => {
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/avi', 'video/quicktime'
      ];
      return allowedTypes.includes(type);
    },
    { message: 'Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, AVI, MOV) are allowed' }
  ),
});

export const captionSchema = z.object({
  caption: z.string().max(500, { message: 'Caption must be less than 500 characters' }).optional(),
});
