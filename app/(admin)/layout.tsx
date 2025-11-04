import MainLayout from '@/layouts/MainLayout'
import { ChildrenType } from '@/types'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SessionProvider } from "next-auth/react";
import { requireAuth } from '@/lib/auth-guard'

const Layout = async ({ children }: ChildrenType) => {
  // This will redirect to signin if user is not authenticated
  await requireAuth()

  return (
    <>
      <SessionProvider>
        <ToastContainer
          theme="colored"
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          toastClassName="text-md"
          pauseOnFocusLoss
          pauseOnHover
        />
        <MainLayout>{children}</MainLayout>
      </SessionProvider>
    </>
  )
}

export default Layout
