export interface Supplier {
  supplier_id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  contact_person: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierInput {
  name: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}