import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.campaignInfo.findUnique({ where: { id: 1 } });
    return NextResponse.json({
      prize: data?.prize ?? 'Troféu Copa MRT 2026',
      end_date: data?.end_date ?? null,
    });
  } catch {
    return NextResponse.json({ prize: 'Troféu Copa MRT 2026', end_date: null });
  }
}
