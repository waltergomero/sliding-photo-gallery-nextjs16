'use server';

import {  signUpFormSchema, createNewUserFormSchema, updateUserFormSchema, signInFormSchema} from '../schemas/validation-schemas';
import { unstable_noStore as noStore } from 'next/cache';
//import { signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcryptjs from "bcryptjs";
import  prisma  from '../lib/prisma';
import { formatError } from '../lib/utils';
import { z } from 'zod';


// Get all the users
export async function getAllUsers({ limit, page, query, }: { limit?: number; page: number; query?: string }) {
  const queryFilter =
    query && query !== 'all'
      ? {
          last_name: {
            contains: query,
            mode: 'insensitive' as const,
          },
        }
      : {};

  const effectiveLimit = limit || 10;

  const data = await prisma.user.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: 'desc' },
    take: effectiveLimit,
    skip: (page - 1) * effectiveLimit,
  });

  const dataCount = await prisma.user.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / effectiveLimit),
  };
}



// Sign in the user with credentials
export async function signInWithCredentials(  prevState:any,  formData: FormData) {
  try {
    // Validate form data against the sign-in schema
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    //search for the user in the database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    console.log('DB User:', dbUser);

    if (!dbUser) {
      return { success: false, message: `User with email: ${user.email} not found ` };
    }
    
    if (!dbUser.password) {
      return { success: false, message: 'User account has no password set.' };
    }
    
    const isPasswordValid = await bcryptjs.compare(user.password, dbUser.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid password. Please try again.' };
    }

    //await signIn('credentials', user);

    return { success: true, message: 'Signed in successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: 'Invalid email or password' };
  }
}

// Sign user out
export async function signOutUser() {
  console.log('Signing out user');
  //await signOut();
  console.log('User signed out successfully');
}

// Sign up user
export async function signUpUser(prevState: any, formData: FormData) {
  try {
    console.log('Signing up user with form data:', formData);
    const user = signUpFormSchema.parse({
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });
    console.log('Parsed user data:', user);
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    console.log('Existing user:', existingUser);
    if (existingUser) {
      return { success: false, message: `User with email ${user.email} already exists` };
    }
    else{
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(user.password, salt);

        await prisma.user.create({
          data: {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            password: hashedPassword,
          },
        });

        // await signIn('credentials', {
        //   email: user.email,
        //   password: user.password,
        // });

        return { success: true, message: 'User registered successfully' };
      }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

// Get user by the ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) throw new Error('User not found');
  return user;
}


// Delete a user
export async function deleteUser(id: string) {
  noStore();

  try {
    await prisma.user.delete({ where: { id: id } });
    revalidatePath('/admin/users');
    redirect('/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
// create new user
export async function createNewUser(formData: FormData) {
  try {
    console.log('Creating new user with form data:', formData);
    const  first_name = formData.get('first_name') as string;
    const  last_name = formData.get('last_name') as string;
    const  email = formData.get('email') as string;
    const  password = formData.get('password') as string;
    const  isadmin = Boolean(formData.get('isadmin'));

    const validatedFields = createNewUserFormSchema.safeParse({
      first_name,
      last_name,
      email,
      password,
      isadmin,
    });

    if (!validatedFields.success) {
      return {
                error: "validation",
                zodErrors: validatedFields.error.flatten().fieldErrors,
                strapiErrors: null,
                message: "Missing information on key fields.",
              };
            }
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return {
        error: "already_exists",
        message: `User with email "${email}" already exists`,
      };
    }
    else{
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password as string, salt);

        await prisma.user.create({
          data: {
            first_name: first_name,
            last_name: last_name,
            name: `${first_name} ${last_name}`,
            email: email,
            password: hashedPassword,
            isadmin: isadmin,
          },
        });

        return { success: true, message: 'User was created successfully' };
      }
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, message: formatError(error) };
  }
}

// Update a user
export async function updateUser(formData: FormData) {
  try {
      const first_name = formData.get("first_name") as string;
      const last_name = formData.get("last_name") as string;
      const name = `${first_name}  ${last_name}`;
      const email = formData.get("email") as string;
      const isadmin = Boolean(formData.get("isadmin"));
      const isactive = Boolean(formData.get("isactive"));
      const userId = formData.get("userid") as string;
      const password = formData.get("password") as string;

      const validatedFields = updateUserFormSchema.safeParse({
          first_name,
          last_name,
          email,
          isactive,
          isadmin
        });
        if (!validatedFields.success) {
          return {
            error: "validation",
            zodErrors: validatedFields.error.flatten().fieldErrors,
            strapiErrors: null,
            message: "Missing information on key fields.",
          };
        }
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return { success: false, message: 'User not found' };
    }
    // Update the user data
    const updatedUser: {
      first_name: string;
      last_name: string;
      name: string;
      isadmin: boolean;
      isactive: boolean;
      password?: string;
    } = {
      first_name,
      last_name,
      name:  name,
      isadmin,
      isactive,
    };
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password as string, salt);
      updatedUser.password = hashedPassword;
    } 
    
    await prisma.user.update({
      where: { id: userId },
      data: updatedUser,
    });

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
//++++-