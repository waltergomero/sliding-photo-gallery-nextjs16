import CategoryCreateForm from '@/components/admin/categories/categorycreateform'
import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Col, Container, Row } from 'react-bootstrap';


const CreateCategoryPage = async () => {

  return (
    <>
      <Container fluid>
        <PageBreadcrumb title="Create New Category Page" subtitle="Category" />
        <Container>
           <Row className="justify-content-center">
            <Col xl={10}>
              <CategoryCreateForm />
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  )
}

export default CreateCategoryPage