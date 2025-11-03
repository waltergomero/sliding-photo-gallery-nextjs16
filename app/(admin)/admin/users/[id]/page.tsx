import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Col, Container, Row } from 'react-bootstrap'
import { getUserById } from '@/actions/user-actions';
import { notFound } from 'next/navigation';
import UserEditForm from '@/components/admin/users/usereditform';



export const metadata= { title: "User" }

interface EditUserPageProps {
    params: Promise<{ id: string }>;
}

const EditUserPage = async (props: EditUserPageProps) => {
    const { id } = await props.params;
    const user = await getUserById(id);

     if (!user) notFound();

  return (
    <>
      <Container fluid>
        <PageBreadcrumb title="Edit User Information" subtitle="User" />

        <Container>
           <Row className="justify-content-center">
            <Col xl={10} lg={12} md={12}>
              <UserEditForm user={user} />
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  )
}

export default EditUserPage
