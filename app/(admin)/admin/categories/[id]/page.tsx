import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Col, Container, Row } from 'react-bootstrap'
import { fetchCategoryById } from '@/actions/category-actions';
import { notFound } from 'next/navigation';
import CategoryEditForm from '@/components/admin/categories/categoryeditform';



export const metadata= { title: "Category" }

interface EditCategoryPageProps {
    params: Promise<{ id: string }>;
}

const EditCategoryPage = async (props: EditCategoryPageProps) => {

    const { id } = await props.params;
    const category = await fetchCategoryById(id);
    console.log("Category data for edit:", category);

     if (!category) notFound();

  return (
    <>
      <Container fluid>
        <PageBreadcrumb title="Edit Category Information" subtitle="Category" />
        <Container>
           <Row className="justify-content-center">
            <Col xl={10}>
              <CategoryEditForm category={category} />
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  )
}

export default EditCategoryPage