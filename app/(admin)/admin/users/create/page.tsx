import UserCreateForm from '@/components/admin/users/usercreateform'
import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Col, Container, Row } from 'react-bootstrap';


const CreateUserPage = async () => {
  return (
    <>
      <Container fluid>
        <PageBreadcrumb title="Create New User Page" subtitle="User" />

        <Container>
           <Row className="justify-content-center">
            <Col xl={10} lg={12} md={12}>
              <UserCreateForm />
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  )
}

export default CreateUserPage
