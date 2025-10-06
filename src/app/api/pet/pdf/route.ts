import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jsPDF } from 'jspdf';

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
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { vaccines: true },
    });
    if (!pet) {
      return NextResponse.json(
        { success: false, error: 'Pet não encontrado' },
        { status: 404 }
      );
    }
    // Gerar PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Ficha de Vacinas do Pet: ${pet.name}`, 10, 20);
    doc.setFontSize(12);
    doc.text(`ID: ${pet.id}`, 10, 30);
    doc.text(`Vacinas:`, 10, 40);
    let y = 50;
    if (pet.vaccines.length === 0) {
      doc.text('Nenhuma vacina cadastrada.', 10, y);
    } else {
      pet.vaccines.forEach((vac, idx) => {
        doc.text(
          `${idx + 1}. ${vac.name} - ${new Date(
            vac.date
          ).toLocaleDateString()}`,
          10,
          y
        );
        y += 10;
      });
    }
    const pdf = doc.output('arraybuffer');
    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=pet_${pet.id}_vacinas.pdf`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar PDF' },
      { status: 500 }
    );
  }
}
