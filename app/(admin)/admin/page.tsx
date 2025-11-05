import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

const Page = async () => {
  // This will redirect to signin if user is not authenticated or not an admin

  return (
    <div>
      <h1>Admin Dashboard</h1>
    </div>
  )
}

export default Page
