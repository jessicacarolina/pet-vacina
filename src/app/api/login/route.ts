import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  try {
    console.log("Tentativa de login:", { email, password });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha inválidos." },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { error: "Email ou senha inválidos." },
        { status: 401 }
      );
    }

    console.log("Usuário autenticado:", user);

    return NextResponse.json({
      message: "Login realizado com sucesso!",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    return NextResponse.json(
      { error: "Erro ao realizar login." },
      { status: 500 }
    );
  }
}