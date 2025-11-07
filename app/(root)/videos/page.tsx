import React, { Fragment } from 'react';

import '@/assets/gallery/css/custom.css';
import '@/assets/gallery/css/equal-height-fix.css';
import '@/assets/gallery/css/jquery.fancybox.min.css';
import { fetchVideos } from '@/actions/gallery-actions';
import GalleryPageScripts from '../collection/[slug]/GalleryPageScripts';

interface VideoItem {
  id: string;
  src: string;
  caption?: string;
  format: string;
  isactive: boolean;
}

const GalleryCategoryPage = async () => {
    // Dynamic route params
    const videos = await fetchVideos();

  return (
  <Fragment>
    <div className="page-header container-fluid p-0">
        <div className="row m-0 align-items-center justify-content-center bg-dark">
            <img src="/images/header-placeholder-min.png" alt="Header Placeholder"/>
            <h1 className="h1 position-absolute single-category-title">Collection<small>Videos</small></h1>
        </div>
      </div>
      <div className='bg-1'>
        <div className="container gallery-wrap mt-sm-5">
          <div className="row artist-gallery-images mb-2">
            {(!Array.isArray(videos) || videos.length === 0) ? (
               <div className="col-sm-6"><h3>No videos found for this collection.</h3></div>
            ) : (
                videos && videos?.map((item: VideoItem, index: number) =>(
                  <div key={index} className="col-sm-3">
                    <div className="photo-box">
                        <div style={{background: `url('${item.src}') no-repeat center center`, backgroundSize: 'contain', backgroundColor: '#000'}}>
                            <video
                                  src={item.src}
                                  controls
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                        </div>
                    </div>
                    </div>	        	            
                  )))          
            }
          </div>
          </div>
          </div>
          
      <GalleryPageScripts />
    </Fragment>

  )
}

export default GalleryCategoryPage