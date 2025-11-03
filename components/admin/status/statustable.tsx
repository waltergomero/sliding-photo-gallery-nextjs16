'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardBody, CardHeader, CardTitle, InputGroup, Table, FormControl, Badge, Alert, Row, Col, Button } from 'react-bootstrap'
import { StatusTableProps, } from '@/types/status';
import { EditStatusBtn, DeleteStatusBtn, CreateStatusBtn } from './buttons';
import { TbSearch, TbSortAscending, TbSortDescending, TbDownload, TbFilter, TbRefresh } from 'react-icons/tb';
import styles from './StatusTable.module.css';
import Loader from '@/components/Loader';
import { stat } from 'fs';

type SortField = 'status_name' | 'typeid' | 'description' | 'isactive' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export interface ExtendedStatusTableProps extends StatusTableProps {
  isLoading?: boolean;
  onRefresh?: () => void;
}

const StatusTable = ({ status, isLoading = false, onRefresh }: ExtendedStatusTableProps) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('status_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter and sort status based on search query and filters
  const filteredAndSortedStatus = useMemo(() => {
    let filtered = status.data.filter(statusItem => {
      const matchesSearch = `${statusItem.status_name} ${statusItem.description || ''}`.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = activeFilter === 'all' || 
        (activeFilter === 'active' && statusItem.isactive) || 
        (activeFilter === 'inactive' && !statusItem.isactive);
        
      return matchesSearch && matchesFilter;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle null values
      if (aValue === null) aValue = '';
      if (bValue === null) bValue = '';
      
      // Convert to string for comparison if needed
      if (typeof aValue === 'boolean') aValue = aValue.toString();
      if (typeof bValue === 'boolean') bValue = bValue.toString();
      if (aValue instanceof Date) aValue = aValue.toISOString();
      if (bValue instanceof Date) bValue = bValue.toISOString();
      
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [status.data, search, sortField, sortOrder, activeFilter]);


  const clearFilters = React.useCallback(() => {
    setSearch('');
    setActiveFilter('all');
    setSortField('status_name');
    setSortOrder('asc');
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = status.data.length;
    const active = status.data.filter(s => s.isactive).length;
    const inactive = total - active;
    const typeIds = new Set(status.data.map(s => s.typeid)).size;
    
    return { total, active, inactive, typeIds };
  }, [status.data]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.getElementById('status-search')?.focus();
            break;
          case 'r':
            e.preventDefault();
            onRefresh?.();
            break;
        }
      }
      if (e.key === 'Escape') {
        if (search || activeFilter !== 'all') {
          clearFilters();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [search, activeFilter, filteredAndSortedStatus.length, onRefresh, clearFilters]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortOrder === 'asc' ? 
      <TbSortAscending className="ms-1" size={16} /> : 
      <TbSortDescending className="ms-1" size={16} />;
  };



  if (isLoading) {
    return (
      <Card className={styles.statusTableCard}>
        <CardHeader>
          <CardTitle>Status Management</CardTitle>
        </CardHeader>
        <CardBody>
          <Loader height="300px" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={styles.statusTableCard}>
      <CardHeader className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <CardTitle className="mb-0">Status Management</CardTitle>
            <Badge bg="primary" className="ms-2">{statistics.total} total</Badge>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            {(search || activeFilter !== 'all' || sortField !== 'status_name') && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearFilters}
                title="Clear all filters and sorting"
              >
                <TbFilter size={16} className="me-1" />
                Clear Filters
              </Button>
            )}
            {onRefresh && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={onRefresh}
                title="Refresh status data"
              >
                <TbRefresh size={16} />
              </Button>
            )}
            
          </div>
        <CreateStatusBtn />
      </CardHeader>

      <CardBody>
        <Row className={`${styles.filterControls} mb-3`}>
          <Col md={8}>
            <InputGroup>
              <InputGroup.Text>
                <TbSearch size={18} />
              </InputGroup.Text>
              <FormControl
                id="status-search"
                className={styles.searchInput}
                placeholder="Search by status name or description... (Ctrl+K to focus)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <FormControl
              as="select"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </FormControl>
          </Col>
        </Row>

        {filteredAndSortedStatus.length === 0 ? (
          <div className={styles.emptyState}>
            <Alert variant="info" className="border-0">
              <strong>No status records found.</strong>
              <div className="mt-2">
                {search || activeFilter !== 'all' ? 
                  'Try adjusting your search criteria or filters.' : 
                  'Start by creating a new status.'}
              </div>
            </Alert>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className={`${styles.statusTable} align-middle mb-0`}>
              <thead className="table-dark">
                <tr>
                  <th scope="col" style={{ width: '10%' }}>ID</th>
                  <th 
                    scope="col" 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('status_name')}
                    style={{ cursor: 'pointer', width: '25%' }}
                    title="Click to sort by status name"
                  >
                    Status Name {getSortIcon('status_name')}
                  </th>
                  <th 
                    scope="col" 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('typeid')}
                    style={{ cursor: 'pointer', width: '10%' }}
                    title="Click to sort by type ID"
                  >
                    Type ID {getSortIcon('typeid')}
                  </th>
                  <th 
                    scope="col" 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('description')}
                    style={{ cursor: 'pointer', width: '30%' }}
                    title="Click to sort by description"
                  >
                    Description {getSortIcon('description')}
                  </th>
                  <th 
                    scope="col" 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('isactive')}
                    style={{ cursor: 'pointer', width: '10%' }}
                    title="Click to sort by active status"
                  >
                    Status {getSortIcon('isactive')}
                  </th>
                  <th scope="col" style={{ width: '15%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStatus.map((statusItem) => (
                  <tr key={statusItem.id}>
                    <td>
                      {statusItem.id.slice(-8)}
                    </td>
                    <td>
                      {statusItem.status_name}
                    </td>
                    <td>
                      <Badge bg="secondary" pill className={styles.statusBadge}>
                        {statusItem.typeid}
                      </Badge>
                    </td>
                    <td>
                     {statusItem.description || <em className="text-muted">No description</em>}
                    </td>
                    <td>
                      <Badge 
                        bg={statusItem.isactive ? 'success' : 'danger'} 
                        className={styles.statusBadge}
                      >
                        {statusItem.isactive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <EditStatusBtn id={statusItem.id} />
                        <DeleteStatusBtn id={statusItem.id} />
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
  )
}

export default StatusTable
