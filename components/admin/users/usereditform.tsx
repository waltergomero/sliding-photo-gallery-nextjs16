'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Button, Col, Form, FormCheck, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';
import ComponentCard from '@/components/cards/ComponentCard';
import { updateUser } from '@/actions/user-actions';
import { ZodErrors } from "@/components/common/zod-errors";
import { SaveUserBtn } from './buttons';

type UserEditFormState = {
  loading: boolean;
  zodErrors: Record<string, string[]> | null;
  error?: string;
  success?: boolean;
  message?: string;
};

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  isadmin: boolean;
  isactive: boolean;
};

type UserEditFormProps = {
  user: User;
};

const UserEditForm = ({ user }: UserEditFormProps) => {
  const router = useRouter();
  const [state, setState] = useState<UserEditFormState>({
    loading: false,
    zodErrors: null,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState({ loading: true, zodErrors: null });

    try {
      const response = await updateUser(formData);

      if (response.error === "validation") {
        setState({ loading: false, zodErrors: response.zodErrors });
        toast.error(response.message);
      } else if (response.error === "already_exists") {
        toast.error("Failed adding a user: " + response.message);
      } else if (response.success === false) {
        toast.error("Failed updating user: " + response.message);
      } else if (response.success) {
        toast.success("User updated successfully");
        router.push('/admin/users');
      } else {
        toast.error("Errors: " + response.error);
      }
    } catch {
      toast.error('Failed to update user');
      setState({ loading: false, zodErrors: null });
    }
  };

  return (
    <ComponentCard title="Edit User Form">
      <Form onSubmit={handleSubmit} className="g-3">
        <Row>
          <Col md={12}>
            <FormGroup className="position-relative mb-3">
              <FormLabel>User Id</FormLabel>
              <FormControl type="text" name="userid" defaultValue={user.id} readOnly />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup className="position-relative mb-3">
              <FormLabel>First name</FormLabel>
              <FormControl type="text" name="first_name" defaultValue={user.first_name} />
              <ZodErrors error={state.zodErrors?.first_name} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup className="position-relative mb-3">
              <FormLabel>Last name</FormLabel>
              <FormControl type="text" name="last_name" defaultValue={user.last_name} />
              <ZodErrors error={state.zodErrors?.last_name} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup className="position-relative mb-3">
              <FormLabel>Email</FormLabel>
              <FormControl type="email" name="email" defaultValue={user.email} />
              <ZodErrors error={state.zodErrors?.email} />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <FormGroup className="position-relative mb-3">
              <FormLabel>Password</FormLabel>
              <FormControl type="password" name="password" />
              <ZodErrors error={state.zodErrors?.password} />
            </FormGroup>
          </Col>
          <Col md={8}>
              <span className="d-block mt-4 text-muted">** Leave password field blank to keep current password</span>        
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <FormGroup className="position-relative">
              <FormCheck
                label="Is user admin?"
                name="isadmin"
                defaultChecked={user.isadmin}
              />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup className="position-relative">
              <FormCheck
                label="Is active?"
                name="isactive"
                defaultChecked={user.isactive}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={8} className="mt-4">
            <Button type="button" onClick={() => router.back()} className="btn btn-light">
              Cancel
            </Button>
            <span className="mx-2"></span>
            <SaveUserBtn />
          </Col>
        </Row>
      </Form>
      <style>{`
        .form-check-input {
          border-color: #7a8794 !important;
        }
      `}</style>
    </ComponentCard>
  );
};

export default UserEditForm;