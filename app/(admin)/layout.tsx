import MainLayout from '@/layouts/MainLayout'
import { ChildrenType } from '@/types'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SessionProvider } from "next-auth/react";

const Layout = ({ children }: ChildrenType) => {
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
