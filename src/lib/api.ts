import { useCallback } from "react";
import { supabase } from "./supabase";
import type { Company, Contact, Deal, Activity } from "./types";

// ---- Companies ----
export function useCompanies() {
  const list = useCallback(async (search?: string) => {
    let q = supabase.from("companies").select("*").order("name");
    if (search) q = q.ilike("name", `%${search}%`);
    const { data, error } = await q;
    if (error) throw error;
    return data as Company[];
  }, []);
  return { list };
}

export function useCompany() {
  const get = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data as Company | null;
  }, []);
  return { get };
}

// ---- Contacts ----
export function useContacts() {
  const list = useCallback(async (search?: string) => {
    let q = supabase
      .from("contacts")
      .select("*, company:companies(*)")
      .order("created_at", { ascending: false });
    if (search) q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) throw error;
    return data as (Contact & { company: Company | null })[];
  }, []);
  return { list };
}

export function useContact() {
  const get = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*, company:companies(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data as (Contact & { company: Company | null }) | null;
  }, []);
  return { get };
}

// ---- Deals ----
export function useDeals() {
  const list = useCallback(async (search?: string, stage?: string) => {
    let q = supabase
      .from("deals")
      .select("*, company:companies(*), contact:contacts(*)")
      .order("created_at", { ascending: false });
    if (search) q = q.ilike("title", `%${search}%`);
    if (stage) q = q.eq("stage", stage);
    const { data, error } = await q;
    if (error) throw error;
    return data as (Deal & { company: Company | null; contact: Contact | null })[];
  }, []);
  return { list };
}

export function useDeal() {
  const get = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("deals")
      .select("*, company:companies(*), contact:contacts(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data as (Deal & { company: Company | null; contact: Contact | null }) | null;
  }, []);
  return { get };
}

// ---- Activities ----
export function useActivities() {
  const list = useCallback(async (filters?: { dealId?: string; contactId?: string }) => {
    let q = supabase.from("activities").select("*").order("created_at", { ascending: false });
    if (filters?.dealId) q = q.eq("deal_id", filters.dealId);
    if (filters?.contactId) q = q.eq("contact_id", filters.contactId);
    const { data, error } = await q;
    if (error) throw error;
    return data as Activity[];
  }, []);
  return { list };
}

// ---- Mutations ----
export async function createCompany(data: Partial<Company>) {
  const { data: result, error } = await supabase.from("companies").insert(data).select().single();
  if (error) throw error;
  return result as Company;
}

export async function updateCompany(id: string, data: Partial<Company>) {
  const { data: result, error } = await supabase.from("companies").update(data).eq("id", id).select().single();
  if (error) throw error;
  return result as Company;
}

export async function deleteCompany(id: string) {
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
}

export async function createContact(data: {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  job_title?: string | null;
  company_id?: string | null;
  notes?: string | null;
}) {
  const { data: result, error } = await supabase.from("contacts").insert(data).select().single();
  if (error) throw error;
  return result as Contact;
}

export async function updateContact(id: string, data: Partial<Contact>) {
  const { data: result, error } = await supabase.from("contacts").update(data).eq("id", id).select().single();
  if (error) throw error;
  return result as Contact;
}

export async function deleteContact(id: string) {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}

export async function createDeal(data: {
  title: string;
  stage?: string;
  capex?: number | null;
  opex?: number | null;
  currency?: string;
  probability?: number | null;
  description?: string | null;
  expected_close_date?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
}) {
  const { data: result, error } = await supabase.from("deals").insert(data).select().single();
  if (error) throw error;
  return result as Deal;
}

export async function updateDeal(id: string, data: Partial<Deal>) {
  const { data: result, error } = await supabase.from("deals").update(data).eq("id", id).select().single();
  if (error) throw error;
  return result as Deal;
}

export async function deleteDeal(id: string) {
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) throw error;
}

export async function createActivity(data: {
  type: string;
  title: string;
  description?: string | null;
  deal_id?: string | null;
  contact_id?: string | null;
}) {
  const { data: result, error } = await supabase.from("activities").insert(data).select().single();
  if (error) throw error;
  return result as Activity;
}

export async function deleteActivity(id: string) {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw error;
}
