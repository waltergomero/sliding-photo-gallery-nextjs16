import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Col, Container, Row } from 'react-bootstrap'
import { getStatusById } from '@/actions/status-actions';
import { notFound } from 'next/navigation';
import StatusEditForm from '@/components/admin/status/statuseditform';
 

export const metadata= { title: "Status" }

interface EditStatusPageProps {
    params: Promise<{ id: string }>;
}

const EditStatusPage = async (props: EditStatusPageProps) => {

    const { id } = await props.params;
    const statusResponse = await getStatusById(id);

    if (!statusResponse?.success || !statusResponse.data) notFound();

  return (
    <>
      <Container fluid>
        <PageBreadcrumb title="Edit Status Information" subtitle="Status" />

        <Container>
           <Row className="justify-content-center">
            <Col xl={8}>
              <StatusEditForm status={{
                id: statusResponse.data.id,
                status_name: statusResponse.data.status_name,
                typeid: statusResponse.data.typeid,
                description: statusResponse.data.description || '',
                isactive: statusResponse.data.isactive ?? false
              }} />
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  )
}

export default EditStatusPage
