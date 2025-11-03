'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import {DeleteImageBtn,  EditImageBtn} from './buttons';
import {fetchImages, fetchCategoriesWithImages, UpdateImageInformation } from "@/actions/gallery-actions";
import {Button, Modal} from "react-bootstrap";
import Image from 'next/image';

interface GalleryGridProps {
  category_name?: string;
}

interface UserImage {
  id: string;
  userId: string;
  categoryId: string;
  category_name: string;
  public_id?: string;
  src: string;
  caption?: string;
  format: string;
  type: string;
  width: number;
  height: number;
  isblackwhite?: boolean;
  isactive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryItem {
  categoryId: string;
  category_name: string;
}


const GalleryGrid = ({category_name}: GalleryGridProps) => {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [images, setImages] = useState<UserImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(category_name?.toLowerCase() || "all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState<UserImage | null>(null);
  const [newCaption, setNewCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const _category_name = category_name ? category_name : "All";

  // Handler to open modal for editing caption
  const handleEditClick = (image: UserImage) => {
    setModalImage(image);
    setNewCaption(image.caption || "");
    setShowModal(true);
  };

  // Handler to update caption
  const handleUpdateCaption = async (id: string, caption: string) => {
    const formData = new FormData();
    formData.append("image_id", id);
    formData.append("caption", caption);
    await UpdateImageInformation(formData);
    setShowModal(false);
    await reloadImages();
  };

  // Handler to reload images (used after delete or update)
  const reloadImages = async () => {
    const imagesData = await fetchImages(selectedCategory || _category_name);
    setImages(imagesData);
  };

  // Initialize selectedCategory when component mounts or category_name prop changes
  useEffect(() => {
    setSelectedCategory(_category_name.toLowerCase());
  }, [_category_name]);

 useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCategoriesWithImages(),
      fetchImages(selectedCategory)
    ]).then(([categoriesData, imagesData]) => {
      setCategories(categoriesData);
      setImages(imagesData);
      setLoading(false);
    });
  }, [selectedCategory]);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  }, []);


  return (
    <div>
       <div className="mb-3 col-md-2">
          <select
            name="category_id"
            onChange={handleChange}
            value={selectedCategory}
            className="form-select">
            {categories.map((category: CategoryItem) => (
                <option key={category.categoryId} value={category.category_name.toLowerCase()}>
                    {category.category_name}
                </option>
            ))}
          </select>
       </div>
       {loading ? (
        <div>Loading...</div>
      ) : images.length === 0 ? (
        <div>No images found.</div>
      ) : (
      <div className="row">
        {images && images.map((item: UserImage, idx: number) => (
          <div className="col-md-2" key={item.id}>
            <div className="thumbnail border p-2 mb-3 position-relative">
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1/1.2',
                  overflow: 'hidden',
                  background: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  
                }}
                onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                role="button"
                tabIndex={0}
              >
                 {item.type === 'image' ? (
                <Image
                  className="img-fluid"
                  src={item.src}
                  alt={item.caption || ''}
                  width="150"
                  height="120"
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />) : (
                  <video
                    className="img-fluid"
                    src={item.src}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    controls
                  />
                )}
              </div>
              <div>
                {item.caption}
              </div>
              <DeleteImageBtn image_id={item.id} image_src={item.src} public_id={item.public_id || ''} onDelete={reloadImages}/>
              <EditImageBtn id={item.id} onClick={() => handleEditClick(item)}/>
                
            </div>
          </div>
        ))}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={images.map((img: UserImage) => ({ src: img.src, alt: img.caption || '', description: img.caption || '' }))}
          index={lightboxIndex}
          on={{
            click: () => {},
          }}
        />
    {/* Modal for editing caption */}
    {showModal && modalImage && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Image Caption</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <img src={modalImage.src} alt={modalImage.caption} style={{ width: '40%', marginBottom: 12 }} />
          </div>
          <input
             type="text"
             value={newCaption}
             onChange={e => setNewCaption(e.target.value)}
             className="form-control mb-2"  />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" className="btn-sm" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <form
            className="d-inline"
            onSubmit={async (e) => {
              e.preventDefault();
              if (modalImage) {
                await handleUpdateCaption(modalImage.id, newCaption);
              }
            }}
          >
            <Button variant="primary" className="btn-sm" type="submit">
              Save
            </Button>
          </form>
        </Modal.Footer>
      </Modal>
    )}
      </div>
      )}
    </div>
  )
}

export default GalleryGrid