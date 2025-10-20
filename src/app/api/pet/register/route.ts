import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const ownerId = formData.get('ownerId');
    const pdfFile = formData.get('pdfFile') as File | null;

    console.log('Dados recebidos:', {
      ownerId,
      hasPdfFile: !!pdfFile,
    });

    // If PDF file is provided, use the extracted info from client
    if (pdfFile) {
      console.log('Processando registro via PDF');
      const extractedInfoStr = formData.get('extractedInfo')?.toString();
      if (!extractedInfoStr) {
        return NextResponse.json(
          {
            success: false,
            error: 'Informações extraídas do PDF não encontradas',
          },
          { status: 400 }
        );
      }

      const extractedInfo = JSON.parse(extractedInfoStr);
      console.log('Received extracted info from client:', extractedInfo);
      if (!extractedInfo.name || !extractedInfo.especie || !ownerId) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Não foi possível extrair todas as informações necessárias do PDF.',
          },
          { status: 400 }
        );
      }

      console.log('Extracted Info from PDF:', extractedInfo);
      // Primeiro, cria o pet
      const pet = await prisma.pet.create({
        data: {
          name: extractedInfo.name,
          especie: extractedInfo.especie,
          raca: extractedInfo.raca || null,
          cor: extractedInfo.cor || null,
          dataNascimento: extractedInfo.dataNascimento
            ? new Date(extractedInfo.dataNascimento)
            : new Date(),
          ownerId: Number(ownerId),
        },
      });

      // Se houver vacinas extraídas, cria os registros de vacina
      if (extractedInfo.vaccines && extractedInfo.vaccines.length > 0) {
        console.log('Processando vacinas extraídas:', extractedInfo.vaccines);

        // Para cada vacina extraída
        for (const vaccine of extractedInfo.vaccines) {
          try {
            // Procura o catálogo de vacina existente
            let vaccineCatalog = await prisma.vaccineCatalog.findFirst({
              where: {
                name: {
                  contains: vaccine.name,
                },
              },
            });

            // Se não encontrar, cria um novo
            if (!vaccineCatalog) {
              vaccineCatalog = await prisma.vaccineCatalog.create({
                data: {
                  name: vaccine.name,
                  fabricante: 'Extraído do PDF',
                  descricao: vaccine.nextDose
                    ? `Próxima dose: ${vaccine.nextDose}`
                    : null,
                },
              });
            }

            // Converte a data do formato DD/MM/YYYY para YYYY-MM-DD
            const [day, month, year] = vaccine.date.split('/');
            const vaccineDate = new Date(`${year}-${month}-${day}`);

            // Cria o registro da vacina para o pet
            await prisma.vaccine.create({
              data: {
                date: vaccineDate,
                petId: pet.id,
                vaccineCatalogId: vaccineCatalog.id,
                name: vaccine.name,
              },
            });
          } catch (error) {
            console.error(`Erro ao processar vacina ${vaccine.name}:`, error);
          }
        }
      }

      return NextResponse.json(
        {
          success: true,
          pet,
          source: 'pdf',
        },
        { status: 201 }
      );
    }

    // Handle manual registration
    const name = formData.get('name')?.toString();
    const especie = formData.get('especie')?.toString();
    const raca = formData.get('raca')?.toString();
    const cor = formData.get('cor')?.toString();
    const dataNascimento = formData.get('dataNascimento')?.toString();

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
