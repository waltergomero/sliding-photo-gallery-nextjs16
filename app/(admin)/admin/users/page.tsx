
import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Col, Container, Row } from 'react-bootstrap'
import { getAllUsers } from '@/actions/user-actions';
import { UsersPageProps } from '@/types/user';
import UsersTable from '@/components/admin/users/userstable';
 

export const metadata = { 
  title: "User Management",
  description: "Manage user records in the photo gallery system"
}


const UserPage = async ({ searchParams }: UsersPageProps) => {

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const searchText = params.query || '';

  const usersData = await getAllUsers({ 
    page, 
    query: searchText 
  });

  return (
    <Container fluid>
      <PageBreadcrumb title="Users" subtitle="Users" />
      <Row className="justify-content-center">
        <Col xxl={10}>
          <UsersTable users={usersData} />
        </Col>
      </Row>
    </Container>
  )
}

export default UserPage