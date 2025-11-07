'use client'
import Customizer from '@/layouts/components/customizer'
import Footer from '@/layouts/components/footer'
import Header from '@/layouts/components/header'
import { ChildrenType } from '@/types'
import { Fragment } from 'react'


const RootLayout = ({ children }: ChildrenType) => {
  return (
    <Fragment>
      <div className="wrapper">
        <Header />
        <div className="content-homepage">
          {children}
         <Footer />
        </div>
      </div>
      <Customizer />
    </Fragment>
  )
}

export default RootLayout
