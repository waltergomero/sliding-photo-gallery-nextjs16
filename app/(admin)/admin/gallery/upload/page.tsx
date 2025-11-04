import React from 'react'
import PageBreadcrumb from '@/components/PageBreadcrumb';
import UploadImages from '@/components/admin/gallery/uploadImages';

export const metadata= { title: "Gallery" }

const UploadPage = async () => {

    return (
            <div className="container-fluid">
                <PageBreadcrumb title="Upload" subtitle="table" />
                 <div className="row justify-content-center">
                    <div className="col-xxl-10">
                        <div className="card">
                            <div className="card-body">
                                <UploadImages />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
)
}
export default UploadPage;