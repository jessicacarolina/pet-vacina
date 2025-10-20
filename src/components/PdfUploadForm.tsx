'use client';

import { useState } from 'react';
import { processPdfWithOcr } from '@/utils/clientPdfOcr';

interface PdfUploadFormProps {
  ownerId: number;
  onSuccess: (pet: any) => void;
  onError: (error: string) => void;
}

export function PdfUploadForm({
  ownerId,
  onSuccess,
  onError,
}: PdfUploadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setProgress('Iniciando processamento do PDF...');

    try {
      const formData = new FormData(event.currentTarget);
      const pdfFile = formData.get('pdfFile') as File;

      if (!pdfFile) {
        throw new Error('Nenhum arquivo PDF selecionado');
      }

      setProgress('Extraindo informações do PDF...');
      const extractedInfo = await processPdfWithOcr(pdfFile);
      console.log('Informações extraídas do PDF:', extractedInfo);

      if (!extractedInfo.name || !extractedInfo.especie) {
        throw new Error(
          'Não foi possível extrair as informações básicas do PDF (nome e espécie são obrigatórios)'
        );
      }

      setProgress('Enviando dados para o servidor...');
      const submitFormData = new FormData();
      submitFormData.append('pdfFile', pdfFile);
      submitFormData.append('ownerId', ownerId.toString());
      submitFormData.append('extractedInfo', JSON.stringify(extractedInfo));

      console.log('Dados sendo enviados para o servidor:', {
        ownerId,
        extractedInfo,
      });

      const response = await fetch('/api/pet/register', {
        method: 'POST',
        body: submitFormData,
      });

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (!response.ok) {
        console.error('Erro na resposta do servidor:', data);
        throw new Error(data.error || 'Erro ao processar o PDF');
      }

      console.log('Pet cadastrado com sucesso:', data.pet);
      onSuccess(data.pet);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : 'Erro ao processar o PDF'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Carteirinha de Vacinação (PDF)
        </label>
        <input
          type="file"
          name="pdfFile"
          accept=".pdf"
          required
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      {progress && <p className="text-sm text-blue-600">{progress}</p>}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Processando...' : 'Enviar PDF'}
      </button>
    </form>
  );
}
