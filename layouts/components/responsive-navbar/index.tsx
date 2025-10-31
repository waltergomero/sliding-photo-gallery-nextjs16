'use client'
import Navbar from '@/layouts/components/navbar'
import Sidenav from '@/layouts/components/sidenav'
import { useEffect, useState } from 'react'

const ResponsiveNavbar = () => {
  const [isMobile, setIsMobile] = useState<null | boolean>(null)

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 992)
    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  if (isMobile === null) return null

  return isMobile ? <Sidenav /> : <Navbar />
}

export default ResponsiveNavbar
