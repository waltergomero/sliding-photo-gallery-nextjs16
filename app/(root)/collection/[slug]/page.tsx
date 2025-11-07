import React, { Fragment } from 'react';
import Link from 'next/link';
import { fetchImagesByCategory, fetchImagesByFormat, fetchBlackAndWhiteImages } from '@/actions/gallery-actions';
import GalleryPageScripts from './GalleryPageScripts';
import '@/assets/gallery/css/custom.css';
import '@/assets/gallery/css/equal-height-fix.css';
import '@/assets/gallery/css/jquery.fancybox.min.css';
import Image from 'next/image';
import { UserImage } from '@/types/gallery';

interface GridImagesPageProps {
    params: Promise<{ slug: string }>;
}

const GridImagesPage = async ({params}: GridImagesPageProps) => {
    const _params = await params;
    const slug = _params.slug ? decodeURIComponent(_params.slug) : 'All';

    let images = [];
    let collection = "";
    //check if slug is a string
    if (slug.length > 2 && isNaN(Number(slug))) {
      collection = slug;
      images = await fetchImagesByCategory(collection);
    }
    //check if slug is a number and number equal to 1
    if (slug === "1" || slug === "2") {
      if (slug === "1") {
        collection = "Landscape";
      }else {
        collection = "Portrait";
      }
       images = await fetchImagesByFormat(collection);
      }

    if (slug === "3") {
       collection = "Black and White";
       images = await fetchBlackAndWhiteImages();
     }

    return (
     <Fragment>
    <div className="page-header container-fluid p-0">
		<div className="row m-0 align-items-center justify-content-center bg-dark" style={{ backgroundColor: '#212529' }}>
		    <img src="/images/header.png" alt="Header Placeholder" />
		    <h1 className="h1 position-absolute single-category-title">Collection<small>{collection}</small></h1>
		</div>
	  </div>
      <div className='bg-1'>
        <div className="container gallery-wrap mt-sm-5">
          <div className="row artist-gallery-images mb-2">
            {(!Array.isArray(images) || images.length === 0) ? (
               <div className="col-sm-6"><h3>No images found for this collection.</h3></div>
            ) : (
                images && images?.map((item: UserImage, index: number) =>(
                  <div key={index} className="col-sm-3">
                    <div className="photo-box position-relative">
                        <Link className="position-absolute enlarge-photo" 
                          href="#" 
                          data-artist={item.caption} 
                          data-url={item.src}>
                        <Image src="/images/magnifier-min.png" alt="Magnifier Icon" width="25" height="25"/></Link>
                        <div style={{background: `url('${item.src}') no-repeat center center`, backgroundSize: 'contain', backgroundColor: '#000'}}>
                          <Image alt='image collection' style={{opacity: 0,}} src={item.src} width="788" height="526"/>
                        </div>
                    </div>
                    </div>	        	            
                  )))          
            }
          </div>
          </div>
          </div>
          
      {/* Full Screen Slider Modal */}
      <div className="fscreen-slider-wrapper">
          <div className="fscreen-slider-close"></div>
          <div className="fscreen-slider"></div>
          <div className="fscreen-page-nav" data-page="1">
              <div className="fscreen-page-arrow fscreen-prev-page"></div>
              <div className="fscreen-page-arrow fscreen-next-page"></div>
          </div>
      </div>
      
      <GalleryPageScripts />
    </Fragment>
  )
}

export default GridImagesPage