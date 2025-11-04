'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import  prisma  from '@/lib/prisma';
const fs = require('fs');
import path from 'path';
import cloudinary from '@/cloudinary/cloudinary-config';

//function to upload image or video to cloudinary

export const fetchImages = async (category_name = "all") => { 
    try {
      noStore(); // Disable caching for this function
      console.log("Fetching images for category:", category_name);
       let _images;

       if (category_name === "all") {
        _images = await prisma.userImages.findMany({});
      }
      else {
        _images = await prisma.userImages.findMany({
          where: {
               AND: [
                {category_name: {
                  equals: category_name,
                  mode: 'insensitive'
                }},
                {isactive: true,
                } 
              ]
          },
        });
      }
        const images = JSON.parse(JSON.stringify(_images));
        console.log("Fetched images:", images.length);
        return images;
    } catch (err) {
        return({error: err + "Failed to fetch images!"});
    }
}

export const fetchImagesByCategory = async (category_name: string) => {
  try {
    //noStore(); // Disable caching for this function
    let _images;
    console.log("Fetching images for category:", category_name);
      if(category_name === "All" || category_name === "0"){
          _images = await prisma.userImages.findMany({
            where: {
              isactive: true,
              type: 'image',
            },
            select: {
              id: true,
              src: true,
              caption: true,
              categoryId: true,
              category_name: true,
              width: true,
              height: true,
              format: true,
              isactive: true
            }
          })
      }
      else{
          _images = await prisma.userImages.findMany({
            where: {
              AND: [
                {category_name: {
                  equals: category_name,
                  mode: 'insensitive'
                }},
                {isactive: true,
                type: 'image'
                } // Only fetch active images
              ]
            },
            select: {
              id: true,
              src: true,
              caption: true,
              categoryId: true,
              category_name: true,
              width: true,
              height: true,
              format: true,
              isactive: true
            }
          }) 
      }
    const images = JSON.parse(JSON.stringify(_images));
    return images

  } catch (err) {
    return({error: "Failed to fetch gallery images by category! " + err});
  }
};

export async function deleteImageFromGallery(image_id: string, image_src: string, public_id: string) {
  try {
    console.log("Deleting image with ID:", image_id, "and source:", image_src);
    const response = await prisma.userImages.delete({ where: {id: image_id}});
    if(response){
      //delete image from cloudinary
      await cloudinary.uploader.destroy(public_id);
      console.log("Deleted image from Cloudinary with public ID:", public_id);

      // Here you would call your cloudinary deletion function, e.g.:
      // await cloudinary.uploader.destroy(publicId);
      // const imagePath = path.join(process.cwd(), 'public', image_src);

      // if (fs.existsSync(imagePath)) {
      //   try {
      //     fs.unlinkSync(imagePath);
      //     console.log("File deleted:", imagePath);
      //   } catch (err) {
      //     console.error("Failed to delete file:", err);
      //   }
      // } else {
      //   console.log("File does not exist:", imagePath);
      // }
    }
    
  } catch (err) {
    return({error: "Failed to delete image! " + err});
  }
  revalidatePath("/admin/gallery");
}


export async function fetchCategoriesWithImages() {
  try {
    //fetch distinct categories from UserImages collection
    const _categories = await prisma.userImages.findMany({
      where: {
        type: 'image',
      },
      select: {
        categoryId: true,
        category_name: true
      },
      distinct: ['categoryId', 'category_name'],
      orderBy: {
        category_name: 'asc'
      }
    });
    const categories = JSON.parse(JSON.stringify(_categories));

    //add categoryId = 0 and category_name = "All" to the categories array
    categories.unshift({ categoryId: "0", category_name: "All" });
    
    return categories;
  } catch (err) {
    return({error: "Failed to fetch categories with images! " + err});
  }
}


export async function fetchOneImagePerCategory() {
  try {
    const _images = await prisma.userImages.findMany({
      distinct: ['category_name'],
      where: {
        type: 'image',
      },
      select: {
        id: true,
        src: true,
        caption: true,
        category_name: true
      },
      orderBy: {
        category_name: 'asc',
      },
    });
    const images = JSON.parse(JSON.stringify(_images));
    return images;
  } catch (err) {
    return({error: "Failed to fetch one image per category! " + err});
  }
}

export async function fetchOneImagePerCategoryLimited() {
  try {
    const _images = await prisma.userImages.findMany({
      distinct: ['category_name'],
      where: {
        format: 'landscape',
        type: 'image',
      },
      select: {
        id: true,
        src: true,
        caption: true,
        category_name: true
      },
      orderBy: {
        category_name: 'asc',
      },
      take: 8
    });
    const images = JSON.parse(JSON.stringify(_images));
    return images;
  } catch (err) {
    return({error: "Failed to fetch one image per category! " + err});
  }
}


export async function UpdateImageInformation(formData: FormData) {
  try {
    const id = formData.get("image_id") as string;
    const caption = formData.get("caption") as string;

    const query = {
      caption: caption,
    };

    await prisma.userImages.update({
      where: {id: id}, data: query});

    return {success: true};
  } catch (err) {
    return({error: "Failed to update image information! " + err});
  }
}

//create function to fetch images by format
export async function fetchImagesByFormat(format: string) {
  console.log("Fetching images by format:", format);
  try {
    const _images = await prisma.userImages.findMany({
      where: {
        AND: [
                {format: {
                  equals: format,
                  mode: 'insensitive'
                }},
                {isactive: true,
                type: 'image'
                } 
              ]
      },
      select: {
        id: true,
        src: true,
        caption: true,
        format: true,
        isactive: true
      }
    });
    const images = JSON.parse(JSON.stringify(_images));
    return images;
  } catch (err) {
    return({error: "Failed to fetch images by format! " + err});
  }
} 

export async function fetchBlackAndWhiteImages() {
  try {
    const _images = await prisma.userImages.findMany({
      where: {
        isblackwhite: true,
        type: 'image',
      },
      select: {
        id: true,
        src: true,
        caption: true,
        format: true,
        isactive: true
      }
    });
    const images = JSON.parse(JSON.stringify(_images));
    return images;
  } catch (err) {
    return({error: "Failed to fetch images by format! " + err});
  }
} 

export async function fetchVideos() {
  try {
    const _videos = await prisma.userImages.findMany({
      where: {
        type: 'video',
      },
      select: {
        id: true,
        src: true,
        caption: true,
        format: true,
        isactive: true
      }
    });
    const videos = JSON.parse(JSON.stringify(_videos));
    return videos;
  } catch (err) {
    return({error: "Failed to fetch videos! " + err});
  }
} 