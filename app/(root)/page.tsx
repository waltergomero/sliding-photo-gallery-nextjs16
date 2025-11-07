import React, { Fragment } from 'react';
import Link from 'next/link';
import { fetchOneImagePerCategoryLimited } from '@/actions/gallery-actions';
//import '@/assets/gallery/css/custom.css';
import Image from 'next/image';
import { UserImage } from '@/types/gallery';


const HomePage = async () => {
    const categories = await fetchOneImagePerCategoryLimited();
  return (
    <Fragment>
      <div>
          <div style={{ textAlign: 'center', left: 0, background: 'black', padding: '20px' }}>
                <h1 className="display-6 font-weight-bold" style={{ color: 'red', fontWeight: 600 }}>WELCOME TO THE</h1>
                <h1 className="display-3" style={{ color: 'white', fontWeight: 600, textTransform: 'uppercase' }}>GRAND CHIMU</h1>
                <h1 className="display-6 font-weight-bold" style={{ color: 'red', fontWeight: 600  }}>PHOTO GALLERY </h1>
          </div>
          <div className="home-header">
              <div className="slider slider-for">                                                               
                  <div>
                     <img src="/images/image-1.jpg" className="img-fluid" alt="..."   />
                  </div>
              </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', margin: 0, justifyContent: 'center', background: 'black', padding: '10px' }}>
          <div className="dropdown">
              <Link href="/collection/3" className="btn btn-featured artist-drop dropdown-toggle">BLACK & WHITE</Link>
          </div>
          <div className="dropdown">
              <Link href="/collection/1" className="btn btn-featured dropdown-toggle">LANDSCAPE</Link>
          </div>
           <div className="dropdown">
              <Link href="/collection/2" className="btn btn-featured dropdown-toggle">PORTRAIT</Link>
          </div>
          <div className="dropdown">
              <Link href="/categories" className="btn btn-featured dropdown-toggle">CATEGORY</Link>
          </div>
        </div>
        <div className="home-gallery mb-2">
            <div className="row">
               {categories && categories?.map((item: Pick<UserImage, 'id' | 'src' | 'caption' | 'category_name'>) =>(    
                  <div key={item.id} style={{ backgroundImage: `url(${item.src})`, height: '500px', backgroundSize: 'cover', backgroundPosition: 'center' }} 
                      className="img-bg-home col-sm-3 p-0 position-relative">
                      <Link href={`/collection/${item.category_name}`}
                      style={{ display: 'flex', margin: 0, alignItems: 'center', justifyContent: 'center' }}>
                      <div className="photo-caption" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <h1 className='text-white'>{item.category_name}</h1><h2 style={{ color: 'red', textTransform: 'uppercase' }}>COLLECTION</h2></div></Link>
                  </div>
               ))
              }
              </div>
          </div>
        </div>   
    </Fragment>
  )
}

export default HomePage

