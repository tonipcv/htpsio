import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const lead = await prisma.insideSalesLead.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        instagram: data.instagram || '',
        area: data.area,
        employees: data.employees,
        revenue: data.revenue,
        useTechnology: data.useTechnology
      }
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Error creating inside sales lead:', error);
    return NextResponse.json(
      { error: 'Erro ao processar sua solicitação' },
      { status: 500 }
    );
  }
} 