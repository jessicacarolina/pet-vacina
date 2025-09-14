"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

  const [pets, setPets] = useState([
    { id: 1, name: "Rex" },
    { id: 2, name: "Luna" },
    { id: 3, name: "Thor" },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleAddPet = () => {
    router.push("/dashboard/add-pet");
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
            Olá, {user?.name || "Usuário"}!
          </h1>
          <button
            onClick={handleAddPet}
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600"
          >
            Cadastrar Pet
          </button>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-gray-400 mb-4">Meus Pets</h2>
          {pets.length > 0 ? (
            <ul className="space-y-4">
              {pets.map((pet) => (
                <li
                  key={pet.id}
                  className="flex justify-between items-center p-4 bg-gray-800 shadow rounded-md"
                >
                  <span className="text-gray-300 font-semibold">{pet.name}</span>
                  <button
                    onClick={() => handleUpdateVaccines(pet.id)}
                    className="px-3 py-1 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
                  >
                    Atualizar Vacinas
                  </button>
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