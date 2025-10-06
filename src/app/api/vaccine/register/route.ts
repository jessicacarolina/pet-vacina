import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, date, petId, vaccineId } = await request.json();
    if (!name || !date || !petId || !vaccineId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nome, data, petId e vaccineId são obrigatórios',
        },
        { status: 400 }
      );
    }

    // Verify if the vaccine exists in the catalog
    const catalogVaccine = await prisma.vaccineCatalog.findUnique({
      where: { id: Number(vaccineId) },
    });

    if (!catalogVaccine) {
      return NextResponse.json(
        { success: false, error: 'Vacina não encontrada no catálogo' },
        { status: 404 }
      );
    }

    const vaccine = await prisma.vaccine.create({
      data: {
        name,
        date: new Date(date),
        petId: Number(petId),
        vaccineCatalogId: Number(vaccineId),
      },
    });
    return NextResponse.json({ success: true, vaccine }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao cadastrar vacina' },
      { status: 400 }
    );
  }
}
