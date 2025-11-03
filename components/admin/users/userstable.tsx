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
import { TbSearch, TbSortAscending, TbSortDescending, TbUsers } from 'react-icons/tb';
import { UserTableProps, User } from '@/types/user';
import { EditUserBtn, DeleteUserBtn, CreateUserBtn } from './buttons';

type SortField = keyof Pick<User, 'first_name' | 'last_name' | 'email' | 'createdAt'>;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

const UsersTable = ({ users }: UserTableProps) => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: 'asc'
  });

  // Enhanced filtering and sorting
  const processedUsers = useMemo(() => {
    let result = [...users.data];

    // Filter users based on search query (case-insensitive)
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter(user =>
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower)
      );
    }

    // Sort users
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
  }, [users.data, search, sortConfig]);

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
          <TbUsers size={20} />
          <CardTitle className="mb-0">Users Management</CardTitle>
          <Badge bg="primary" className="ms-2">{users.data.length} total</Badge>
        </div>
        <CreateUserBtn />
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
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search users"
              />
            </InputGroup>
          </Col>
          <Col md={6} className="d-flex justify-content-end align-items-center">
            {search.trim() && (
              <small className="text-muted">
                Showing {processedUsers.length} of {users.data.length} users
              </small>
            )}
          </Col>
        </Row>

        {/* Table */}
        {processedUsers.length === 0 ? (
          <Alert variant="info" className="text-center">
            <TbUsers size={24} className="mb-2" />
            <div>
              {search.trim() 
                ? `No users found matching "${search}"`
                : 'No users available'
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
                    onClick={() => handleSort('last_name')}
                    style={{ cursor: 'pointer' }}
                  >
                    Last Name {getSortIcon('last_name')}
                  </th>
                  <th 
                    scope="col" 
                    className="text-uppercase fs-xxs sortable-header"
                    onClick={() => handleSort('first_name')}
                    style={{ cursor: 'pointer' }}
                  >
                    First Name {getSortIcon('first_name')}
                  </th>
                  <th 
                    scope="col" 
                    className="text-uppercase fs-xxs sortable-header"
                    onClick={() => handleSort('email')}
                    style={{ cursor: 'pointer' }}
                  >
                    Email {getSortIcon('email')}
                  </th>
                  <th scope="col" className="text-uppercase fs-xxs">Admin</th>
                  <th scope="col" className="text-uppercase fs-xxs">Status</th>
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
                {processedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <code className="text-muted small">{user.id.slice(0, 8)}...</code>
                    </td>
                    <td>
                      <strong>{user.last_name}</strong>
                    </td>
                    <td>{user.first_name}</td>
                    <td>
                        {user.email}
                    </td>
                    <td>
                      {renderStatusBadge(user.isadmin, 'Admin')}
                    </td>
                    <td>
                      {renderStatusBadge(user.isactive, 'Active')}
                    </td>
                    <td>
                      <small className="text-muted">{formatDate(user.createdAt)}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-1 justify-content-center">
                        <EditUserBtn id={user.id} />
                        <DeleteUserBtn id={user.id} />
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

export default UsersTable
