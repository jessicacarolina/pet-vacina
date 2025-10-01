import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, fabricante, descricao, faixaEtaria, dose } =
      await request.json();
    if (!name || !fabricante) {
      return NextResponse.json(
        { success: false, error: 'Nome e fabricante são obrigatórios.' },
        { status: 400 }
      );
    }
    const vaccine = await prisma.vaccineCatalog.create({
      data: {
        name,
        fabricante,
        descricao: descricao || null,
        faixaEtaria: faixaEtaria || null,
        dose: dose || null,
      },
    });
    return NextResponse.json({ success: true, vaccine }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao cadastrar vacina.' },
      { status: 400 }
    );
  }
}
