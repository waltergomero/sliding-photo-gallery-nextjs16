import React from 'react';
import PageBreadcrumb from '@/components/PageBreadcrumb'
import { Col, Container, Row } from 'react-bootstrap'
import { getAllCategories } from '@/actions/category-actions';
import { UsersPageProps } from '@/types/user';
import CategoryTable from '@/components/admin/categories/categorytable';

export const metadata = { 
  title: "Category Management",
  description: "Manage category records in the photo gallery system"
}


const CategoryPage = async ({ searchParams }: UsersPageProps) => {

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const searchText = params.query || '';

  const categoriesData = await getAllCategories({ 
    page, 
    query: searchText 
  });

  return (
    <Container fluid>
      <PageBreadcrumb title="Categories" subtitle="Categories" />
      <Row className="justify-content-center">
        <Col xxl={10}>
          <CategoryTable categories={categoriesData} />
        </Col>
      </Row>
    </Container>
  )
}

export default CategoryPage