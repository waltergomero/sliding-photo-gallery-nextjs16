/**
 * User Actions - Server-side functions for user management
 * Handles CRUD operations, authentication, and user-related business logic
 */
'use server';

import { 
  createStatusSchema, 
  updateStatusSchema, 
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

interface UsersResult {
  data: any[];
  totalPages: number;
}

interface GetStatusParams {
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
 * Get all statuses with pagination and filtering
 */
export async function getAllStatus({ 
  limit = DEFAULT_PAGE_LIMIT, 
  page, 
  query 
}: GetStatusParams): Promise<UsersResult> {
  try {
    const queryFilter = query && query !== 'all'
      ? {
          OR: [
            {
              status_name: {
                contains: query,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [data, dataCount] = await Promise.all([
      prisma.status.findMany({
        where: queryFilter,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          status_name: true,
          isactive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.status.count({ where: queryFilter }),
    ]);

    return {
      data,
      totalPages: Math.ceil(dataCount / limit),
    };
  } catch (error) {
    console.error('Error fetching statuses:', error);
    throw new Error('Failed to fetch statuses');
  }
}

/**
 * Get status by ID
 */
export async function getStatusById(statusId: string) {
  try {
    const status = await prisma.status.findUnique({
      where: { id: statusId },
      select: {
        id: true,
        status_name: true,
        isactive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!status) {
      throw new Error('Status not found');
    }

    return status;
  } catch (error) {
    console.error('Error fetching status:', error);
    throw error;
  }
}

/**
 * Delete status by ID
 */
export async function deleteStatus(id: string): Promise<void> {
  noStore();

  try {
    await prisma.status.delete({ 
      where: { id } 
    });
    
    revalidatePath('/admin/status');
    redirect('/admin/status');
  } catch (error) {
    console.error('Error deleting status:', error);
    throw new Error('Failed to delete status');
  }
}

/**
 * Create new status (admin function)
 */
export async function createNewStatus(
  formData: FormData
): Promise<ActionResult | ValidationResult> {
  try {
    const formFields = {
      status_name: formData.get('status_name') as string,
      typeid: parseInt(formData.get('typeid') as string, 10),
    };

    console.log("Form Fields in createNewStatus:", formFields);
    // Validate form data
    const validatedFields = createStatusSchema.safeParse(formFields);
    console.log("Validated Fields in createNewStatus:", validatedFields);
    if (!validatedFields.success) {
      return formatValidationError(validatedFields.error);
    }

    const { status_name, typeid } = validatedFields.data;

    // Check if status already exists
    const existingStatus = await prisma.status.findFirst({
      where: { status_name: status_name,
               typeid: typeid },
      select: { id: true },
    });

    if (existingStatus) {
      return {
        success: false,
        message: `Status with name "${status_name}" already exists`,
      };
    }

    const newStatus = await prisma.status.create({
      data: {
        status_name,
        typeid,
        isactive: true,
      },
      select: {
        id: true,
        status_name: true,
        typeid: true,
      },
    });

    return { 
      success: true, 
      message: 'Status created successfully',
      data: newStatus,
    };
  } catch (error) {
    return handleActionError(error, 'Failed to create status');
  }
}

/**
 * Update existing status
 */
export async function updateStatus(
  formData: FormData
): Promise<ActionResult | ValidationResult> {
  try {
    const formFields = {
      statusid: formData.get("statusid") as string,
      status_name: formData.get("status_name") as string,
      typeid: parseInt(formData.get('typeid') as string, 10),
      isactive: Boolean(formData.get("isactive")),
    };

    // Validate form data
    const validatedFields = updateStatusSchema.safeParse(formFields);
    if (!validatedFields.success) {
      return formatValidationError(validatedFields.error);
    }

    const { status_name, isactive, typeid } = validatedFields.data;

    // Check if status exists
    const existingStatus = await prisma.status.findUnique({ 
      where: { id: formFields.statusid, typeid: typeid },
      select: { id: true, status_name: true, typeid: true, isactive: true },
    });

    if (existingStatus) {
      if (existingStatus.id != formFields.statusid) {
        return  {error: "already_exists",
                 message: `Status "${status_name}" with type ID "${typeid}" already exists`}; 
      }
    }

    // Prepare update data
    const updateData: {
      status_name: string;
      typeid: number;
      isactive: boolean;
    } = {
      status_name,
      typeid,
      isactive: isactive ?? true,
    };

    // Update user
    const updatedUser = await prisma.status.update({
      where: { id: formFields.statusid },
      data: updateData,
      select: {
        id: true,
        status_name: true,
        typeid: true,
        isactive: true,
      },
    });

    return {
      success: true,
      message: 'Status updated successfully',
      data: updatedUser,
    };
  } catch (error) {
    return handleActionError(error, 'Failed to update status');
  }
}


