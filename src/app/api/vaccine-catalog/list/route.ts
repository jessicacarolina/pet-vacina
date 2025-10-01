import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vaccines = await prisma.vaccineCatalog.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json({ success: true, vaccines });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar vacinas' },
      { status: 500 }
    );
  }
}
