export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  company_id: string | null;
  notes: string | null;
  created_at: string;
  company?: Company | null;
}

export interface Deal {
  id: string;
  title: string;
  stage: string;
  capex: number | null;
  opex: number | null;
  total_value: number | null;
  currency: string;
  probability: number | null;
  description: string | null;
  expected_close_date: string | null;
  contact_id: string | null;
  company_id: string | null;
  created_at: string;
  company?: Company | null;
  contact?: Contact | null;
}

export interface Activity {
  id: string;
  type: "note" | "meeting" | "call";
  title: string;
  description: string | null;
  deal_id: string | null;
  contact_id: string | null;
  created_at: string;
}
