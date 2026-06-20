'use server';
import { prisma } from '@/lib/prisma';

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
  if (id) {
    await prisma.franchise.update({ where: { id }, data: { name, points } });
  } else {
    await prisma.franchise.create({ data: { name, points } });
  }
}

export async function deleteFranchise(password: string, id: string): Promise<void> {
  checkPassword(password);
  await prisma.franchise.delete({ where: { id } });
}

export async function upsertSeller(
  password: string,
  id: string | undefined,
  name: string,
  points: number,
): Promise<void> {
  checkPassword(password);
  if (id) {
    await prisma.seller.update({ where: { id }, data: { name, points } });
  } else {
    await prisma.seller.create({ data: { name, points } });
  }
}

export async function deleteSeller(password: string, id: string): Promise<void> {
  checkPassword(password);
  await prisma.seller.delete({ where: { id } });
}

export async function updatePrize(password: string, prize: string): Promise<void> {
  checkPassword(password);
  await prisma.campaignInfo.upsert({
    where: { id: 1 },
    update: { prize },
    create: { id: 1, prize },
  });
}

export async function updateEndDate(password: string, end_date: string | null): Promise<void> {
  checkPassword(password);
  await prisma.campaignInfo.upsert({
    where: { id: 1 },
    update: { end_date },
    create: { id: 1, prize: 'Troféu Copa MRT 2026', end_date },
  });
}
