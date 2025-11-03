'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Button, Col, Form, FormGroup, FormLabel, FormControl, Row } from 'react-bootstrap';
import ComponentCard from '@/components/cards/ComponentCard';
import { createNewCategory } from '@/actions/category-actions';
import { ZodErrors } from "@/components/common/zod-errors";
import { SaveCategoryBtn } from './buttons';
import { getArrayOfNumbers } from '@/lib/utils';

 const typeIds = getArrayOfNumbers();

type CategoryCreateFormState = {
  loading: boolean;
  zodErrors: Record<string, string[]> | null;
  error?: string;
  success?: boolean;
  message?: string;
};

const initialState: CategoryCreateFormState = {
  loading: false,
  zodErrors: null,
  error: undefined,
  success: undefined,
  message: undefined,
};

const CategoryCreateForm = () => {
  const router = useRouter();
  const [state, setState] = useState<CategoryCreateFormState>(initialState);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState({ ...initialState, loading: true });

     try {
        const response = await createNewCategory(formData);
        console.log("Response from createNewCategory:", response);
        if ('error' in response && response.error === "validation") {
          setState({ ...initialState, zodErrors: response.zodErrors || null });
          toast.error(response.message);
        } else if ('error' in response && response.error === "already_exists") {
          setState({ ...initialState });
          toast.error("Failed adding a category: " + response.message);
        } 
        else if ('success' in response && response.success === false) {
          setState({ ...initialState });
          toast.error("Failed creating category: " + response.message);
        }
        else if ('success' in response && response.success) {
          toast.success("Category created successfully");
          router.push('/admin/categories');
        } else {
          setState({ ...initialState });
          toast.error("Errors: " + ('error' in response ? response.error : 'Unknown error'));
        }
      } catch (error) {
          setState({ ...initialState });
          console.error('Error in handleSubmit:', error); // Add this line
          toast.error('Failed to create category');
      }
  }

  return (
    <ComponentCard title="New Category Form">
      <Form onSubmit={handleSubmit} className="g-3">
        <Row>
          <Col md={4}>
            <FormGroup className="position-relative mb-3">
              <FormLabel>Category Name</FormLabel>
              <FormControl type="text" name="category_name" />
              <ZodErrors error={state.zodErrors?.category_name} />
            </FormGroup>
          </Col>
          <Col md={8}>
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
            <SaveCategoryBtn loading={state.loading} />
          </Col>
        </Row>
      </Form>
    </ComponentCard>
  );
};

export default CategoryCreateForm;