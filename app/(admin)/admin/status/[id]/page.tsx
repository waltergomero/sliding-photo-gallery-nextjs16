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
    const status = await getStatusById(id);

    if (!status) notFound();

  return (
    <>
      <Container fluid>
        <PageBreadcrumb title="Edit Status Information" subtitle="Status" />

        <Container>
           <Row className="justify-content-center">
            <Col xl={10}>
              <StatusEditForm status={status} />
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  )
}

export default EditStatusPage
