'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Button, Col, Form, FormGroup, FormLabel, FormControl, Row , FormCheck} from 'react-bootstrap';
import ComponentCard from '@/components/cards/ComponentCard';
import { updateCategory } from '@/actions/category-actions';
import { ZodErrors } from "@/components/common/zod-errors";
import { SaveCategoryBtn } from './buttons';
import { getArrayOfNumbers } from '@/lib/utils';
import { Category } from '@/types/category';

 const typeIds = getArrayOfNumbers();

type CategoryEditFormState = {
  loading: boolean;
  zodErrors: Record<string, string[]> | null;
  error?: string;
  success?: boolean;
  message?: string;
};


type CategoryEditFormProps = {
  category: Category;
};

const CategoryEditForm = ({ category }: CategoryEditFormProps) => {
  const router = useRouter();
    const [state, setState] = useState<CategoryEditFormState>({
      loading: false,
      zodErrors: null,
    });
  

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState({ ...state, loading: true });

     try {
        const response = await updateCategory(formData);
        console.log("Response from updateCategory:", response);
        if ('error' in response && response.error === "validation") {
          setState({ ...state, zodErrors: response.zodErrors || null });
          toast.error(response.message);
        } else if ('error' in response && response.error === "already_exists") {
          setState({ ...state });
          toast.error("Failed updating category: " + response.message);
        } 
        else if ('success' in response && response.success === false) {
          setState({ ...state });
          toast.error("Failed updating category: " + response.message);
        }
        else if ('success' in response && response.success) {
          toast.success("Category updated successfully");
          router.push('/admin/categories');
        } else {
          setState({ ...state });
          toast.error("Errors: " + ('error' in response ? response.error : 'Unknown error'));
        }
      } catch (error) {
          setState({ ...state });
          console.error('Error in handleSubmit:', error); // Add this line
          toast.error('Failed to update category');
      }
  }

  return (
    <ComponentCard title="Edit Category Form">
      <Form onSubmit={handleSubmit} className="g-3">
        <Row>
          <Col md={12}>
            <FormGroup className="position-relative mb-3">
              <FormLabel>Category Id</FormLabel>
              <FormControl type="text" name="categoryid" defaultValue={category.id} readOnly />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup className="position-relative mb-3">
              <FormLabel>Category Name</FormLabel>
              <FormControl type="text" name="category_name" defaultValue={category.category_name} />
              <ZodErrors error={state.zodErrors?.category_name} />
            </FormGroup>
          </Col>
          <Col md={8}>
            <FormGroup className="position-relative mb-3">
              <FormLabel>Description</FormLabel>
              <FormControl type="text" name="description" defaultValue={category.description || ''} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup className="position-relative">
              <FormCheck
                label="Is active?"
                name="isactive"
                defaultChecked={category.isactive ?? false}
              />
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

export default CategoryEditForm;