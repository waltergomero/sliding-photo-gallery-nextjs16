export interface Category {
  id: string;
  category_name: string;
  description: string | null;
  isactive: boolean | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CategoryTableProps {
  categories: {
    data: Category[];
    totalPages: number;
  };
}

export interface CategoryPageSearchParams {
  page?: string;
  query?: string;
}

export interface CategoryPageProps {
  searchParams: Promise<CategoryPageSearchParams>;
}

export interface GetAllCategoriesParams {
  limit?: number;
  page: number;
  query?: string;
}