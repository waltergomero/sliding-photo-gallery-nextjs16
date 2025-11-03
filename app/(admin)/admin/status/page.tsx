import React from 'react';
import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Col, Container, Row } from 'react-bootstrap'
import { getAllStatus } from '@/actions/status-actions';
import { StatusPageProps } from '@/types/status';
import StatusTable from '@/components/admin/status/statustable';


export const metadata = { 
  title: "Status Management",
  description: "Manage status records in the photo gallery system"
}


const StatusPage = async ({ searchParams }: StatusPageProps) => {


  const params = await searchParams;
  const page = Number(params.page) || 1;
  const searchText = params.query || '';

  const statusData = await getAllStatus({ 
    page, 
    query: searchText 
  });

  return (
    <Container fluid>
      <PageBreadcrumb title="Status" subtitle="Status" />
      <Row className="justify-content-center">
        <Col xxl={10}>
          <StatusTable status={statusData} />
        </Col>
      </Row>
    </Container>
  )
}

export default StatusPage