/*
# CRM Schema - PipelineIQ

Creates the core tables for a CRM system: companies, contacts, deals, and activities.
Single-tenant app (no auth required) - all data is intentionally shared/public.

## Tables

1. `companies` - Organizations that contacts belong to and deals are associated with
   - name (required), industry, website, phone, address, notes
   
2. `contacts` - Individual people, optionally linked to a company
   - first_name + last_name (required), email, phone, job_title, company_id (FK), notes
   
3. `deals` - Sales opportunities moving through a pipeline
   - title (required), stage (enum with 6 values), capex, opex, currency, probability,
     description, expected_close_date, contact_id (FK), company_id (FK)
   - total_value is computed as capex + opex via a generated column
   
4. `activities` - Timeline events tied to deals and/or contacts
   - type (note/meeting/call), title, description, deal_id (FK), contact_id (FK)

## Security

- RLS enabled on all tables
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because this is a single-tenant app with intentionally shared/public data
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE)
*/

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  website text,
  phone text,
  address text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_companies" ON companies;
CREATE POLICY "anon_select_companies" ON companies FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_companies" ON companies;
CREATE POLICY "anon_insert_companies" ON companies FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_companies" ON companies;
CREATE POLICY "anon_update_companies" ON companies FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_companies" ON companies;
CREATE POLICY "anon_delete_companies" ON companies FOR DELETE TO anon, authenticated USING (true);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  job_title text,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contacts" ON contacts;
CREATE POLICY "anon_select_contacts" ON contacts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contacts" ON contacts;
CREATE POLICY "anon_insert_contacts" ON contacts FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_contacts" ON contacts;
CREATE POLICY "anon_update_contacts" ON contacts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contacts" ON contacts;
CREATE POLICY "anon_delete_contacts" ON contacts FOR DELETE TO anon, authenticated USING (true);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  stage text NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'appointment_scheduled', 'demo_given', 'contract_sent', 'closed_won', 'closed_lost')),
  capex numeric(12,2) DEFAULT 0,
  opex numeric(12,2) DEFAULT 0,
  total_value numeric(12,2) GENERATED ALWAYS AS (COALESCE(capex, 0) + COALESCE(opex, 0)) STORED,
  currency text NOT NULL DEFAULT 'USD',
  probability integer,
  description text,
  expected_close_date date,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_deals" ON deals;
CREATE POLICY "anon_select_deals" ON deals FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_deals" ON deals;
CREATE POLICY "anon_insert_deals" ON deals FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_deals" ON deals;
CREATE POLICY "anon_update_deals" ON deals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_deals" ON deals;
CREATE POLICY "anon_delete_deals" ON deals FOR DELETE TO anon, authenticated USING (true);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'note' CHECK (type IN ('note', 'meeting', 'call')),
  title text NOT NULL,
  description text,
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activities" ON activities;
CREATE POLICY "anon_select_activities" ON activities FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activities" ON activities;
CREATE POLICY "anon_insert_activities" ON activities FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_activities" ON activities;
CREATE POLICY "anon_update_activities" ON activities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_activities" ON activities;
CREATE POLICY "anon_delete_activities" ON activities FOR DELETE TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
