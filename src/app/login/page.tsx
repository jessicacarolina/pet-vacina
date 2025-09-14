"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao fazer login.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
      <Image
        className=""
        src="/favicon.ico"
        alt="logo"
        width={180}
        height={38}
        priority
      />
      <h1 className="text-2xl font-bold text-gray-400 mb-4">Login</h1>
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Entrar
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-400">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-blue-500 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}