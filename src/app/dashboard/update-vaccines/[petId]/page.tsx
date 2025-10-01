'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function UpdateVaccines() {
  const router = useRouter();
  const params = useParams();
  const petId = Number(params?.petId);

  const [vaccines, setVaccines] = useState<
    { id: number; name: string; date: string }[]
  >([]);
  const [catalogVaccines, setCatalogVaccines] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedVaccineId, setSelectedVaccineId] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (petId) {
      fetchVaccines();
      fetchCatalogVaccines();
    }
    // eslint-disable-next-line
  }, [petId]);

  const fetchCatalogVaccines = async () => {
    try {
      const res = await fetch('/api/vaccine-catalog/list');
      const data = await res.json();
      if (data.success) {
        setCatalogVaccines(data.vaccines);
      } else {
        setCatalogVaccines([]);
      }
    } catch {
      setCatalogVaccines([]);
    }
  };

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vaccine/list?petId=${petId}`);
      const data = await res.json();
      if (data.success) {
        setVaccines(data.vaccines);
      } else {
        setVaccines([]);
      }
    } catch {
      setVaccines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const selectedVaccine = catalogVaccines.find(
        (v) => v.id === Number(selectedVaccineId)
      );
      if (!selectedVaccine) throw new Error('Vacina não selecionada');

      const res = await fetch('/api/vaccine/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedVaccine.name,
          vaccineId: selectedVaccine.id,
          date,
          petId,
        }),
      });
      if (!res.ok) throw new Error('Erro ao cadastrar vacina');
      setSelectedVaccineId('');
      setDate('');
      fetchVaccines();
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-md shadow-md w-full max-w-lg">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-4 px-4 py-2 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700"
        >
          ← Voltar para Dashboard
        </button>
        <h2 className="text-2xl font-bold text-gray-300 mb-6">
          Vacinas do Pet
        </h2>
        <button
          onClick={() => {
            window.open(`/api/pet/pdf?petId=${petId}`, '_blank');
          }}
          className="mb-6 px-4 py-2 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700"
        >
          Baixar Relatório em PDF
        </button>
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Vacina</label>
            <select
              value={selectedVaccineId}
              onChange={(e) => setSelectedVaccineId(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-gray-200 focus:outline-none"
              required
            >
              <option value="">Selecione uma vacina</option>
              {catalogVaccines.map((vaccine) => (
                <option key={vaccine.id} value={vaccine.id}>
                  {vaccine.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Data da Vacina</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
            {loading ? 'Salvando...' : 'Adicionar Vacina'}
          </button>
        </form>
        <h3 className="text-lg font-semibold text-gray-400 mb-4">
          Vacinas Agendadas/Cadastradas
        </h3>
        {loading ? (
          <p className="text-gray-400">Carregando...</p>
        ) : vaccines.length > 0 ? (
          <ul className="space-y-3">
            {vaccines.map((vac) => (
              <li
                key={vac.id}
                className="p-3 bg-gray-700 rounded-md flex justify-between items-center"
              >
                <span className="text-gray-200 font-semibold">{vac.name}</span>
                <span className="text-gray-400">
                  {new Date(vac.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">
            Nenhuma vacina cadastrada para este pet.
          </p>
        )}
      </div>
    </div>
  );
}
