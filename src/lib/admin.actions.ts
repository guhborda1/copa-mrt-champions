'use server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Configuração do Supabase ausente no servidor');
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('Admin password não configurada');
  if (password !== expected) throw new Error('Senha incorreta');
}

export async function verifyAdminPassword(password: string): Promise<void> {
  checkPassword(password);
}

export async function upsertFranchise(
  password: string,
  id: string | undefined,
  name: string,
  points: number,
): Promise<void> {
  checkPassword(password);
  const admin = getAdminClient();
  const q = id
    ? admin.from('franchises').update({ name, points }).eq('id', id)
    : admin.from('franchises').insert({ name, points });
  const { error } = await q;
  if (error) throw new Error(error.message);
}

export async function deleteFranchise(password: string, id: string): Promise<void> {
  checkPassword(password);
  const admin = getAdminClient();
  const { error } = await admin.from('franchises').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function upsertSeller(
  password: string,
  id: string | undefined,
  name: string,
  points: number,
): Promise<void> {
  checkPassword(password);
  const admin = getAdminClient();
  const q = id
    ? admin.from('sellers').update({ name, points }).eq('id', id)
    : admin.from('sellers').insert({ name, points });
  const { error } = await q;
  if (error) throw new Error(error.message);
}

export async function deleteSeller(password: string, id: string): Promise<void> {
  checkPassword(password);
  const admin = getAdminClient();
  const { error } = await admin.from('sellers').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updatePrize(password: string, prize: string): Promise<void> {
  checkPassword(password);
  const admin = getAdminClient();
  const { error } = await admin.from('campaign_info').update({ prize }).eq('id', 1);
  if (error) throw new Error(error.message);
}

export async function updateEndDate(password: string, end_date: string | null): Promise<void> {
  checkPassword(password);
  const admin = getAdminClient();
  const { error } = await admin.from('campaign_info').update({ end_date }).eq('id', 1);
  if (error) throw new Error(error.message);
}
