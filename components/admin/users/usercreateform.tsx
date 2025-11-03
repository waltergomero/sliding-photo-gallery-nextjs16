'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Button, Col, Form, FormCheck, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';
import ComponentCard from '@/components/cards/ComponentCard';
import { createNewUser } from '@/actions/user-actions';
import { ZodErrors } from "@/components/common/zod-errors";
import { SaveUserBtn } from './buttons';


type UserCreateFormState = {
  loading: boolean;
  zodErrors: Record<string, string[]> | null;
  error?: string;
  success?: boolean;
  message?: string;
};

const initialState: UserCreateFormState = {
  loading: false,
  zodErrors: null,
  error: undefined,
  success: undefined,
  message: undefined,
};

const UserCreateForm = () => {
  const router = useRouter();
  const [state, setState] = useState<UserCreateFormState>(initialState);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState({ ...initialState, loading: true });

    try {
      const response = await createNewUser(formData);
      console.log("Response from createNewUser:", response);
      if ('error' in response && response.error === "validation") {
        setState({ ...initialState, zodErrors: response.zodErrors || null });
        toast.error(response.message);
      } else if ('error' in response && response.error === "already_exists") {
        setState({ ...initialState });
        toast.error("Failed adding a user: " + response.message);
      } 
      else if ('success' in response && response.success === false) {
        setState({ ...initialState });
        toast.error("Failed creating user: " + response.message);
      }
      else if ('success' in response && response.success) {
        toast.success("User created successfully");
        router.push('/admin/users');
      } else {
        setState({ ...initialState });
        toast.error("Errors: " + ('error' in response ? response.error : 'Unknown error'));
      }
    } catch (error) {
        setState({ ...initialState });
        console.error('Error in handleSubmit:', error); // Add this line
        toast.error('Failed to create user');
    }
  }

  return (
    <ComponentCard title="New User Form">
      <Form onSubmit={handleSubmit} className="g-3" autoComplete="off">
        <Row>
          <Col md={4}>
            <FormGroup className="position-relative mb-3">
              <FormLabel htmlFor="first_name">First name</FormLabel>
              <FormControl
                id="first_name"
                type="text"
                name="first_name"
                autoComplete="given-name"
              />
              <ZodErrors error={state.zodErrors?.first_name} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup className="position-relative mb-3">
              <FormLabel htmlFor="last_name">Last name</FormLabel>
              <FormControl
                id="last_name"
                type="text"
                name="last_name"
                autoComplete="family-name"
              />
              <ZodErrors error={state.zodErrors?.last_name} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup className="position-relative mb-3">
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormControl
                id="email"
                type="email"
                name="email"
                autoComplete="email"
              />
              <ZodErrors error={state.zodErrors?.email} />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <FormGroup className="position-relative mb-3">
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormControl
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
              />
              <ZodErrors error={state.zodErrors?.password} />
            </FormGroup>
          </Col>
          </Row>
        <Row>
          <Col md={4} className="d-flex align-items-end mb-3">
            <FormGroup className="position-relative">
              <FormCheck
                label="Is user admin?"
                name="isadmin"
                id="isadmin"
              />
            </FormGroup>
          </Col>
          <Col md={12} className="mt-4">
            <Button
              type="button"
              onClick={() => router.back()}
              className="btn btn-light"
              disabled={state.loading}
            >
              Cancel
            </Button>
            <span className="mx-2"></span>
            <SaveUserBtn />
          </Col>
        </Row>
        {state.error && (
          <div className="alert alert-danger mt-3">{state.error}</div>
        )}
      </Form>
      <style>{`
        .form-check-input {
          border-color: #7a8794 !important;
        }
      `}</style>
    </ComponentCard>
  );
};

export default UserCreateForm;