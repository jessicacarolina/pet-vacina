import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const petId = Number(searchParams.get('petId'));
  if (!petId) {
    return NextResponse.json(
      { success: false, error: 'petId obrigatório' },
      { status: 400 }
    );
  }
  try {
    const vaccines = await prisma.vaccine.findMany({
      where: { petId },
      select: { id: true, name: true, date: true },
      orderBy: { date: 'asc' },
    });
    return NextResponse.json({ success: true, vaccines });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar vacinas' },
      { status: 500 }
    );
  }
}
