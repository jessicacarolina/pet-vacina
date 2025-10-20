'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PdfUploadForm } from '@/components/PdfUploadForm';

export default function AddPet() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [especie, setEspecie] = useState('');
  const [raca, setRaca] = useState('');
  const [cor, setCor] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationMethod, setRegistrationMethod] = useState<
    'manual' | 'pdf'
  >('manual');

  const getUserId = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.id;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ownerId = getUserId();
    if (!ownerId) {
      setError('Usuário não encontrado. Faça login novamente.');
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('especie', especie);
      formData.append('raca', raca || '');
      formData.append('cor', cor || '');
      formData.append('dataNascimento', dataNascimento);
      formData.append('ownerId', ownerId.toString());

      const res = await fetch('/api/pet/register', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Erro ao cadastrar pet');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-md shadow-md w-full max-w-md">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-4 px-4 py-2 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700"
        >
          ← Voltar para Dashboard
        </button>

        <h2 className="text-2xl font-bold text-gray-300 mb-6">Cadastrar Pet</h2>

        <div className="mb-6 flex space-x-4">
          <button
            type="button"
            onClick={() => setRegistrationMethod('manual')}
            className={`flex-1 py-2 px-4 rounded-md font-bold ${
              registrationMethod === 'manual'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Cadastro Manual
          </button>
          <button
            type="button"
            onClick={() => setRegistrationMethod('pdf')}
            className={`flex-1 py-2 px-4 rounded-md font-bold ${
              registrationMethod === 'pdf'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Upload PDF
          </button>
        </div>

        {registrationMethod === 'pdf' ? (
          <PdfUploadForm
            ownerId={getUserId() || 0}
            onSuccess={() => router.push('/dashboard')}
            onError={setError}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Nome do Pet</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-gray-200 focus:outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Espécie</label>
              <input
                type="text"
                value={especie}
                onChange={(e) => setEspecie(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-gray-200 focus:outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Raça</label>
              <input
                type="text"
                value={raca}
                onChange={(e) => setRaca(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-gray-200 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Cor</label>
              <input
                type="text"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-gray-200 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-gray-200 focus:outline-none"
                required
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
