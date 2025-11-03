/**
 * User Actions - Server-side functions for user management
 * Handles CRUD operations, authentication, and user-related business logic
 */
'use server';

import { 
  createCategorySchema, 
  updateCategorySchema, 
} from '../schemas/validation-schemas';
import { unstable_noStore as noStore } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '../lib/prisma';
import { formatError } from '../lib/utils';
import { z } from 'zod';

// Types for better type safety
interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

interface ValidationResult {
  error: string;
  zodErrors?: Record<string, string[]>;
  strapiErrors?: null;
  message: string;
}

interface CategoryResult {
  data: any[];
  totalPages: number;
}

interface GetCategoryParams {
  limit?: number;
  page: number;
  query?: string;
}

// Constants
const DEFAULT_PAGE_LIMIT = 10;

// Utility function for consistent error handling
function handleActionError(error: unknown, defaultMessage: string): ActionResult {
  if (isRedirectError(error)) {
    throw error;
  }
  
  const message = error instanceof Error ? formatError(error) : defaultMessage;
  console.error('Action error:', error);
  
  return { 
    success: false, 
    message 
  };
}

// Utility function for validation error formatting
function formatValidationError(error: z.ZodError): ValidationResult {
  return {
    error: "validation",
    zodErrors: error.flatten().fieldErrors,
    strapiErrors: null,
    message: "Missing or invalid information in required fields.",
  };
}

/**
 * Get all categories with pagination and filtering
 */
export async function getAllCategories({ 
  limit = DEFAULT_PAGE_LIMIT, 
  page, 
  query 
}: GetCategoryParams): Promise<CategoryResult> {
  try {
    const queryFilter = query && query !== 'all'
      ? {
          OR: [
            {
              category_name: {
                contains: query,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [data, dataCount] = await Promise.all([
      prisma.category.findMany({
        where: queryFilter,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          category_name: true,
          description: true,
          isactive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.category.count({ where: queryFilter }),
    ]);

    return {
      data,
      totalPages: Math.ceil(dataCount / limit),
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

/**
 * Get category by ID
 */
export async function fetchCategoryById(categoryId: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        category_name: true,
        description: true,
        isactive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
}

/**
 * Delete category by ID
 */
export async function deleteCategory(id: string): Promise<void> {
  noStore();

  try {
    await prisma.status.delete({ 
      where: { id } 
    });
    
    revalidatePath('/admin/categories');
    redirect('/admin/categories');
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
}

/**
 * Create new category (admin function)
 */
export async function createNewCategory(
  formData: FormData
): Promise<ActionResult | ValidationResult> {
  try {
    const formFields = {
      category_name: formData.get('category_name') as string,
      typeid: parseInt(formData.get('typeid') as string, 10),
    };

    console.log("Form Fields in createNewCategory:", formFields);
    // Validate form data
    const validatedFields = createCategorySchema.safeParse(formFields);
    console.log("Validated Fields in createNewCategory:", validatedFields);
    if (!validatedFields.success) {
      return formatValidationError(validatedFields.error);
    }

    const { category_name, } = validatedFields.data;

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: { category_name: category_name,
},
      select: { id: true, category_name: true},
    });

    if (existingCategory) {
      return {
        success: false,
        message: `Category with name "${category_name}" already exists`,
      };
    }

    const newCategory = await prisma.category.create({
      data: {
        category_name,
        isactive: true,
      },
      select: {
        id: true,
        category_name: true,
        description: true,
        isactive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { 
      success: true, 
      message: 'Category created successfully',
      data: newCategory,
    };
  } catch (error) {
    return handleActionError(error, 'Failed to create category');
  }
}

/**
 * Update existing category
 */
export async function updateCategory(
  formData: FormData
): Promise<ActionResult | ValidationResult> {
  try {
    const formFields = {
      categoryid: formData.get("categoryid") as string,
      category_name: formData.get("category_name") as string,
      description: formData.get("description") as string,
      isactive: Boolean(formData.get("isactive")),
    };

    // Validate form data
    const validatedFields = updateCategorySchema.safeParse(formFields);
    if (!validatedFields.success) {
      return formatValidationError(validatedFields.error);
    }

    const { category_name, isactive, description } = validatedFields.data;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: formFields.categoryid },
      select: { id: true, category_name: true, isactive: true, description: true },
    });

    if (existingCategory) {
      if (existingCategory.id != formFields.categoryid) {
        return  {error: "already_exists",
                 message: `Category "${category_name}" already exists`}; 
      }
    }

    // Prepare update data
    const updateData: {
      category_name: string;
      isactive: boolean;
      description?: string;
    } = {
      category_name,
      isactive: isactive ?? true,
      description: formFields.description,
    };

    // Update category
    const updateCategory = await prisma.category.update({
      where: { id: formFields.categoryid },
      data: updateData,
      select: {
        id: true,
        category_name: true,
        isactive: true,
        description: true,
      },
    });

    return {
      success: true,
      message: 'Category updated successfully',
      data: updateCategory,
    };
  } catch (error) {
    return handleActionError(error, 'Failed to update category');
  }
}


