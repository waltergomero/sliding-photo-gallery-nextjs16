export interface Status {
  id: string;
  status_name: string;
  description: string | null;
  isactive: boolean | null;
  typeid: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface StatusTableProps {
  status: {
    data: Status[];
    totalPages: number;
  };
}

export interface StatusPageSearchParams {
  page?: string;
  query?: string;
}

export interface StatusPageProps {
  searchParams: Promise<StatusPageSearchParams>;
}
