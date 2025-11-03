'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Button, Col, Form, FormGroup, FormLabel, FormControl, Row } from 'react-bootstrap';
import ComponentCard from '@/components/cards/ComponentCard';
import { createNewStatus } from '@/actions/status-actions';
import { ZodErrors } from "@/components/common/zod-errors";
import { SaveStatusBtn } from './buttons';
import { getArrayOfNumbers } from '@/lib/utils';

 const typeIds = getArrayOfNumbers();

type StatusCreateFormState = {
  loading: boolean;
  zodErrors: Record<string, string[]> | null;
  error?: string;
  success?: boolean;
  message?: string;
};

const initialState: StatusCreateFormState = {
  loading: false,
  zodErrors: null,
  error: undefined,
  success: undefined,
  message: undefined,
};

const StatusCreateForm = () => {
  const router = useRouter();
  const [state, setState] = useState<StatusCreateFormState>(initialState);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState({ ...initialState, loading: true });

     try {
        const response = await createNewStatus(formData);
        console.log("Response from createNewStatus:", response);
        if ('error' in response && response.error === "validation") {
          setState({ ...initialState, zodErrors: response.zodErrors || null });
          toast.error(response.message);
        } else if ('error' in response && response.error === "already_exists") {
          setState({ ...initialState });
          toast.error("Failed adding a status: " + response.message);
        } 
        else if ('success' in response && response.success === false) {
          setState({ ...initialState });
          toast.error("Failed creating status: " + response.message);
        }
        else if ('success' in response && response.success) {
          toast.success("Status created successfully");
          router.push('/admin/status');
        } else {
          setState({ ...initialState });
          toast.error("Errors: " + ('error' in response ? response.error : 'Unknown error'));
        }
      } catch (error) {
          setState({ ...initialState });
          console.error('Error in handleSubmit:', error); // Add this line
          toast.error('Failed to create status');
      }
  }

  return (
    <ComponentCard title="New Status Form">
      <Form onSubmit={handleSubmit} className="g-3">
        <Row>
          <Col md={6}>
            <FormGroup className="position-relative mb-3">
              <FormLabel>Status Name</FormLabel>
              <FormControl type="text" name="status_name" />
              <ZodErrors error={state.zodErrors?.status_name} />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup className="position-relative mb-3">
              <FormLabel htmlFor="status_type">Type</FormLabel>
              <FormControl as="select"  name="typeid">
                {typeIds?.map((id: number) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </Col>
          <Col md={12}>
            <FormGroup className="position-relative mb-3">
              <FormLabel>Description</FormLabel>
              <FormControl type="text" name="description" />
            </FormGroup>
          </Col>
          <Col md={12} className="mt-4">
            <Button type="button" onClick={() => router.back()} className="btn btn-light">
              Cancel
            </Button>
            <span className="mx-2"></span>
            <SaveStatusBtn loading={state.loading} />
          </Col>
        </Row>
      </Form>
    </ComponentCard>
  );
};

export default StatusCreateForm;