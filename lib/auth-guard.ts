import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin')
  }

  return session
}

export async function requireAdmin() {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin')
  }

  if (session?.user?.isadmin !== true) {
    redirect('/signin')
  }

  return session
}
