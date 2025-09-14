import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, phone, password } = body;
  try {
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json(
        { error: "Este email já está cadastrado." },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: { name, email, phone, password },
    });

    return NextResponse.json({
      message: "Usuário cadastrado com sucesso!",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao cadastrar o usuário." },
      { status: 500 }
    );
  }
}