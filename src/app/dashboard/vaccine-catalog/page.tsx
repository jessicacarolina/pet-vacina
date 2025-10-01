'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VaccineCatalog {
  id: number;
  name: string;
  fabricante: string;
  descricao?: string;
  faixaEtaria?: string;
  dose?: string;
}

export default function VaccineCatalog() {
  const router = useRouter();

  const [vaccines, setVaccines] = useState<VaccineCatalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [descricao, setDescricao] = useState('');
  const [faixaEtaria, setFaixaEtaria] = useState('');
  const [dose, setDose] = useState('');

  // Fetch all vaccines on component mount
  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vaccine-catalog/list');
      const data = await res.json();
      if (data.success) {
        setVaccines(data.vaccines);
      } else {
        setError('Erro ao carregar vacinas');
      }
    } catch (err) {
      setError('Erro ao carregar vacinas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/vaccine-catalog/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          fabricante,
          descricao,
          faixaEtaria,
          dose,
        }),
      });

      if (!res.ok) throw new Error('Erro ao cadastrar vacina');

      // Reset form
      setName('');
      setFabricante('');
      setDescricao('');
      setFaixaEtaria('');
      setDose('');

      // Refresh list
      fetchVaccines();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar vacina');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100">
            Catálogo de Vacinas
          </h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700"
          >
            ← Voltar para Dashboard
          </button>
        </div>

        {/* Form Section */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">
            Cadastrar Nova Vacina
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">
                Nome da Vacina*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-gray-200 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Fabricante*</label>
              <input
                type="text"
                value={fabricante}
                onChange={(e) => setFabricante(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-gray-200 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-gray-200 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">Faixa Etária</label>
                <input
                  type="text"
                  value={faixaEtaria}
                  onChange={(e) => setFaixaEtaria(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-gray-700 text-gray-200 focus:outline-none"
                  placeholder="Ex: 0-5 anos"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Dose</label>
                <input
                  type="text"
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-gray-700 text-gray-200 focus:outline-none"
                  placeholder="Ex: Dose única"
                />
              </div>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Vacina'}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">
            Vacinas Cadastradas
          </h2>
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : vaccines.length > 0 ? (
            <div className="grid gap-4">
              {vaccines.map((vaccine) => (
                <div key={vaccine.id} className="bg-gray-700 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200">
                        {vaccine.name}
                      </h3>
                      <p className="text-gray-400">
                        Fabricante: {vaccine.fabricante}
                      </p>
                      {vaccine.descricao && (
                        <p className="text-gray-400 mt-2">
                          {vaccine.descricao}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {vaccine.faixaEtaria && (
                        <p className="text-gray-400">
                          Faixa etária: {vaccine.faixaEtaria}
                        </p>
                      )}
                      {vaccine.dose && (
                        <p className="text-gray-400">Dose: {vaccine.dose}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Nenhuma vacina cadastrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
