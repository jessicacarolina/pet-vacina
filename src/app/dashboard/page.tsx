'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [pets, setPets] = useState<
    {
      id: number;
      name: string;
      especie?: string;
      raca?: string;
      cor?: string;
      dataNascimento?: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchPets(parsedUser.id);
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchPets = async (userId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pet/list?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setPets(data.pets);
      } else {
        setPets([]);
      }
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPet = () => {
    router.push('/dashboard/add-pet');
  };

  const handleUpdateVaccines = (petId: number) => {
    router.push(`/dashboard/update-vaccines/${petId}`);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-900 flex justify-center items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-center items-center">
          <Image
            className=""
            src="/favicon.ico"
            alt="logo"
            width={180}
            height={38}
            priority
          />
        </div>
        <header className="flex justify-between items-center mb-6 mt-4">
          <h1 className="text-2xl font-bold text-gray-400">
            Olá, {user?.name || 'Usuário'}!
          </h1>
          <button
            onClick={handleAddPet}
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600"
          >
            Cadastrar Pet
          </button>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-gray-400 mb-4">
            Meus Pets
          </h2>
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : pets.length > 0 ? (
            <ul className="space-y-4">
              {pets.map((pet) => (
                <li
                  key={pet.id}
                  className="p-4 bg-gray-800 shadow rounded-md flex flex-col md:flex-row md:justify-between md:items-center"
                >
                  <div className="flex-1">
                    <div className="text-lg font-bold text-blue-300 mb-1">
                      {pet.name}
                    </div>
                    <div className="text-gray-400 text-sm mb-1">
                      <span className="font-semibold">Espécie:</span>{' '}
                      {pet.especie || '-'}
                      {pet.raca && (
                        <span>
                          {' '}
                          | <span className="font-semibold">Raça:</span>{' '}
                          {pet.raca}
                        </span>
                      )}
                      {pet.cor && (
                        <span>
                          {' '}
                          | <span className="font-semibold">Cor:</span>{' '}
                          {pet.cor}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm mb-1">
                      <span className="font-semibold">Nascimento:</span>{' '}
                      {pet.dataNascimento
                        ? new Date(pet.dataNascimento).toLocaleDateString()
                        : '-'}
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <button
                      onClick={() => handleUpdateVaccines(pet.id)}
                      className="px-3 py-1 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
                    >
                      Atualizar Vacinas
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Nenhum pet cadastrado ainda.</p>
          )}
        </section>
      </div>
    </div>
  );
}
