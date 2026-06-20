import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const table = request.nextUrl.searchParams.get('table');

  try {
    if (table === 'franchises') {
      const data = await prisma.franchise.findMany({ orderBy: { points: 'desc' } });
      return NextResponse.json(data);
    }
    if (table === 'sellers') {
      const data = await prisma.seller.findMany({ orderBy: { points: 'desc' } });
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: 'Parâmetro table inválido' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
