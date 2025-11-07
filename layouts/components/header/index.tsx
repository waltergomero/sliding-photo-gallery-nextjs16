'use client'
import AppLogo from '@/components/AppLogo'
import { useLayoutContext } from '@/context/useLayoutContext'
import useScrollEvent from '@/hooks/useScrollEvent'
import Link from 'next/link'
import { useState } from 'react'
import { Alert, Button, Container, Nav, Navbar, NavbarBrand, NavbarCollapse, NavbarToggle, NavLink } from 'react-bootstrap'
import { TbContrast } from 'react-icons/tb';
//import { useSession } from "next-auth/react"
//import {SignOut}  from '@/components/auth/signout'


//const navItems = ['Home', 'Categories', 'Videos', 'Landscape', 'Portrait', 'Blog', 'Contact']
const navItems = [{ name: 'Home', path: '/' }, { name: 'Categories', path: '/categories' }, { name: 'Videos', path: '/videos' }, 
                  { name: 'Landscape', path: '/collection/1' }, { name: 'Portrait', path: '/collection/2' }, { name: 'B&W', path: '/collection/3' }, { name: 'Contact', path: '/contact' }]
export default function Header() {
  //const { data: session } = useSession()

  const { theme, changeTheme } = useLayoutContext()

  const toggleTheme = () => {
    if (theme === 'dark') {
      changeTheme('light')
      return
    }
    changeTheme('dark')
    return
  }
  const [isCollapsed, setIsCollapsed] = useState(true)
  const { scrollY } = useScrollEvent()

  return (
    <>
      <header>
        <Navbar expand="lg" className={`py-2 sticky-top ${scrollY > 100 && 'top-scroll-up top-fixed'}`} id="landing-navbar">
          <Container>
            <NavbarBrand className="auth-brand mb-0">
              <AppLogo />
            </NavbarBrand>

            <NavbarToggle aria-controls="navbarSupportedContent" onClick={() => setIsCollapsed(!isCollapsed)} />
            <NavbarCollapse in={!isCollapsed} id="navbarSupportedContent">
              <Nav className="fw-medium gap-2 fs-sm mx-auto mt-2 mt-lg-0">
                {navItems.map((item, idx) => (
                  <li className="nav-item" key={idx}>
                    <NavLink className="nav-link" href={item.path}>
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </Nav>
              <div className="d-flex align-items-center">
                <Button variant="link" className="btn-icon fw-semibold text-body me-2" onClick={toggleTheme}>
                  <TbContrast className="fs-22" />
                </Button>
                {/* {session ? (
                  <>
                    <Link href="/admin" className="btn btn-link fw-semibold text-body ps-2">
                      Admin Page
                    </Link>
                    <SignOut />
                  </>
                   ) : (
                  <Link href="/signin" className="btn btn-sm btn-primary ms-2">
                    Sign In
                  </Link>
                )} */}
              </div>
            </NavbarCollapse>
          </Container>
        </Navbar>
      </header>
    </>
  )
}
