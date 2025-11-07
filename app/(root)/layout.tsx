import RootLayout from '@/layouts/RootLayout'
import { ChildrenType } from '@/types';
import { SessionProvider } from "next-auth/react"

const Layout = ({ children }: ChildrenType) => {
  return (
    <SessionProvider>
      <RootLayout>{children}</RootLayout>
    </SessionProvider>
  )
}

export default Layout
