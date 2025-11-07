import React, { Fragment } from 'react';

import '@/assets/gallery/css/custom.css';
import '@/assets/gallery/css/equal-height-fix.css';
import '@/assets/gallery/css/jquery.fancybox.min.css';
import { fetchOneImagePerCategory } from '@/actions/gallery-actions';
import Image from 'next/image';

interface CategoryImageItem {
  id: string;
  src: string;
  caption?: string;
  category_name: string;
}

const GalleryCategoryPage = async () => {
    // Dynamic route params
    const categories = await fetchOneImagePerCategory();

  return (
    <Fragment>
        <div className="page-header container-fluid p-0">
		    <div className="row m-0 align-items-center justify-content-center bg-dark" style={{ backgroundColor: '#212529' }}>
		    <img src="/images/header.png" alt="Header Placeholder"/>
		    <h1 className="h1 position-absolute single-category-title">Category<small>Collections</small></h1>
		</div>
	  </div>
    <div className='pb-1'>
        <div className="container gallery-wrap mt-sm-5">
          <div className="row artist-gallery-images">
            {categories && categories?.map((item: CategoryImageItem, index: number) =>(          
              <div key={index} className="col-sm-3">
                <div className="photo-box position-relative">     
                    <div style={{background: `url('${item.src}') no-repeat center center`, backgroundSize: 'contain', backgroundColor: '#000'}}>
                      <a href={`/collection/${item.category_name}`}>
                      <Image alt='image collection' style={{opacity: 0}} src={item.src} width="788" height="526"/>
                      <div className="photo-caption" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}><h2>{item.category_name}</h2><p style={{ color: 'red' }}>COLLECTION</p></div>
                      </a>
                    </div>
                </div>
                </div>	        	            
            ))}
          </div>
          </div>
          </div>
    </Fragment>

  )
}

export default GalleryCategoryPage