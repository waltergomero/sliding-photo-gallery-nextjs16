'use client';
import React, { useState, useMemo } from 'react';
import { 
  FormControl, 
  Card, 
  CardBody, 
  CardHeader, 
  CardTitle, 
  InputGroup, 
  Table, 
  Badge,
  Row,
  Col,
  Alert,
  Spinner
} from 'react-bootstrap';
import { TbSearch, TbSortAscending, TbSortDescending, TbCategory } from 'react-icons/tb';
import { CategoryTableProps, Category } from '@/types/category';
import { EditCategoryBtn, DeleteCategoryBtn, CreateCategoryBtn } from './buttons';

type SortField = keyof Pick<Category, 'category_name' | 'createdAt'>;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

const CategoryTable = ({ categories }: CategoryTableProps) => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: 'asc'
  });

  // Enhanced filtering and sorting
  const processedCategories = useMemo(() => {
    let result = [...categories.data];

    // Filter categories based on search query (case-insensitive)
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter(category =>
        category.category_name.toLowerCase().includes(searchLower)
      );
    }

    // Sort categories
    if (sortConfig.field) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.field!];
        const bValue = b[sortConfig.field!];
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;
        
        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [categories.data, search, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? 
      <TbSortAscending className="ms-1" size={14} /> : 
      <TbSortDescending className="ms-1" size={14} />;
  };

  const renderStatusBadge = (isActive: boolean, label: string) => (
    <Badge 
      bg={isActive ? 'success' : 'secondary'} 
      className="d-inline-flex align-items-center gap-1"
    >
      <span 
        className={`badge-dot ${isActive ? 'bg-white' : 'bg-light'}`}
        style={{ width: '6px', height: '6px', borderRadius: '50%' }}
      />
      {isActive ? 'Yes' : 'No'}
    </Badge>
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <TbCategory size={20} />
          <CardTitle className="mb-0">Category Management</CardTitle>
          <Badge bg="primary" className="ms-2">{categories.data.length} total</Badge>
        </div>
        <CreateCategoryBtn />
      </CardHeader>

      <CardBody>
        {/* Search Input */}
        <Row className="mb-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>
                <TbSearch size={16} />
              </InputGroup.Text>
              <FormControl
                placeholder="Search by category name or created date..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search category"
              />
            </InputGroup>
          </Col>
          <Col md={6} className="d-flex justify-content-end align-items-center">
            {search.trim() && (
              <small className="text-muted">
                Showing {processedCategories.length} of {categories.data.length} categories
              </small>
            )}
          </Col>
        </Row>

        {/* Table */}
        {processedCategories.length === 0 ? (
          <Alert variant="info" className="text-center">
            <TbCategory size={24} className="mb-2" />
            <div>
              {search.trim() 
                ? `No category found matching "${search}"`
                : 'No category available'
              }
            </div>
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover className="table-custom align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="text-uppercase fs-xxs">ID</th>
                  <th 
                    scope="col" 
                    className="text-uppercase fs-xxs sortable-header"
                    onClick={() => handleSort('category_name')}
                    style={{ cursor: 'pointer' }}
                  >
                    Category Name {getSortIcon('category_name')}
                  </th>
                  <th 
                    scope="col" 
                    className="text-uppercase fs-xxs sortable-header"
                    style={{ cursor: 'pointer' }}
                  >
                    Description
                  </th>
                  <th scope="col" className="text-uppercase fs-xxs">Is Active?</th>
                  <th 
                    scope="col" 
                    className="text-uppercase fs-xxs sortable-header"
                    onClick={() => handleSort('createdAt')}
                    style={{ cursor: 'pointer' }}
                  >
                    Created {getSortIcon('createdAt')}
                  </th>
                  <th scope="col" className="text-uppercase fs-xxs text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <code className="text-muted small">{category.id.slice(0, 8)}...</code>
                    </td>
                    <td>
                      <strong>{category.category_name}</strong>
                    </td>
                    <td>
                        <strong>{category.description}</strong>
                    </td>
                    <td>
                      {renderStatusBadge(category.isactive ?? false, 'Active')}
                    </td>
                    <td>
                      <strong>{formatDate(category.createdAt)}</strong>
                    </td>
                    <td>
                      <div className="d-flex gap-1 justify-content-center">
                        <EditCategoryBtn id={category.id} />
                        <DeleteCategoryBtn id={category.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default CategoryTable
