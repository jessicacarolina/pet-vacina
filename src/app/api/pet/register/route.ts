import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, especie, raca, cor, dataNascimento, ownerId } =
      await request.json();
    if (!name || !especie || !dataNascimento || !ownerId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Todos os campos obrigatórios: nome, espécie, dataNascimento, ownerId.',
        },
        { status: 400 }
      );
    }
    const pet = await prisma.pet.create({
      data: {
        name,
        especie,
        raca: raca || null,
        cor: cor || null,
        dataNascimento: new Date(dataNascimento),
        ownerId: Number(ownerId),
      },
    });
    return NextResponse.json({ success: true, pet }, { status: 201 });
  } catch (error) {
    console.log('Erro ao cadastrar pet:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao cadastrar pet' },
      { status: 400 }
    );
  }
}
