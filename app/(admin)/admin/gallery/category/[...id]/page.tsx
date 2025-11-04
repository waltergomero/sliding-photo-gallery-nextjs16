import React from 'react';
import GalleryGrid from '@/components/admin/gallery/gallery-grid';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-guard'

const GalleryPage = async ({params}: { params: Promise<{id: string[]}>}) => {
    const _params = await params;
     await requireAdmin();
    
    // Dynamic route params
    const categoryName = _params.id ? decodeURIComponent(_params.id[0]) : 'All';

  return (
            <div className="container-fluid">
                <PageBreadcrumb title="Gallery" subtitle="table" />
                 <div className="row justify-content-center">
                    <div className="col-xxl-12">
                        <div className="card">
                            <div className="card-body">
                                <Link href="/admin/gallery/upload" className="btn btn-secondary mb-3">Upload Images</Link>
                                <GalleryGrid category_name={categoryName} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

  )
}

export default GalleryPage