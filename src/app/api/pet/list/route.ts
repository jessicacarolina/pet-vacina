import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = Number(searchParams.get('userId'));
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Usuário não informado' },
      { status: 400 }
    );
  }
  try {
    const pets = await prisma.pet.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        cor: true,
        especie: true,
        raca: true,
        dataNascimento: true,
      },
    });
    return NextResponse.json({ success: true, pets });
  } catch (error) {
    console.error('Erro ao buscar pets:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar pets' },
      { status: 500 }
    );
  }
}
