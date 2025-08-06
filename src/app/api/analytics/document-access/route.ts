import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { getClientIp } from '@/lib/utils';
import crypto from 'crypto';

// Schema for document view event
const documentViewSchema = z.object({
  documentId: z.string().uuid(),
  visitorToken: z.string().optional(),
  event: z.enum(['documentViewed', 'documentClosed']),
  timestamp: z.number(), // Unix timestamp in milliseconds
  duration: z.number().optional(), // Duration in seconds (only for documentClosed event)
  userAgent: z.string(),
});

// Implementação simplificada de geolocalização sem dependências externas
async function getLocationFromIp(ip: string): Promise<{ city?: string; country?: string }> {
  try {
    // Não fazer geolocalização para IPs locais/privados
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        city: 'Local',
        country: 'Network'
      };
    }
    
    // Em um ambiente de produção, você poderia implementar uma chamada a uma API
    // de geolocalização com limites mais generosos ou usar um serviço pago.
    // Por enquanto, apenas registramos o IP e retornamos valores padrão.
    
    // Gerar um hash do IP para fins de análise sem armazenar o IP real
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 8);
    console.log(`IP processado: ${ipHash}`);
    
    return {
      city: 'Unknown',
      country: 'Unknown'
    };
  } catch (error) {
    console.error('Error processing IP:', error);
    return {
      city: 'Unknown',
      country: 'Unknown'
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get user session if available
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Parse request body
    const body = await req.json();
    const validatedData = documentViewSchema.parse(body);
    
    // Get client IP
    const ipAddress = getClientIp(req) || '127.0.0.1';
    
    // Get location data from IP
    const location = await getLocationFromIp(ipAddress);
    
    if (validatedData.event === 'documentViewed') {
      // Create new access log entry
      const accessLog = await prisma.documentAccessLog.create({
        data: {
          documentId: validatedData.documentId,
          userId: userId || null,
          visitorToken: !userId ? validatedData.visitorToken : null,
          accessStartTime: new Date(), // Definir explicitamente o horário de início
          userAgent: validatedData.userAgent,
          ipAddress: ipAddress,
          city: location.city || 'Unknown',
          country: location.country || 'Unknown',
        }
      });
      
      return NextResponse.json({ success: true, logId: accessLog.id });
    } else if (validatedData.event === 'documentClosed') {
      // Find the most recent open access log for this document and user/visitor using Prisma Client
      let whereCondition: any = {
        documentId: validatedData.documentId,
        accessEndTime: null
      };
      
      if (userId) {
        whereCondition.userId = userId;
      } else if (validatedData.visitorToken) {
        whereCondition.visitorToken = validatedData.visitorToken;
      } else {
        return NextResponse.json({ success: false, error: 'No user ID or visitor token provided' }, { status: 400 });
      }
      
      // Buscar o log de acesso mais recente
      const accessLog = await prisma.documentAccessLog.findFirst({
        where: whereCondition,
        orderBy: {
          accessStartTime: 'desc'
        }
      });
      
      if (!accessLog) {
        return NextResponse.json({ success: false, error: 'No matching open access log found' }, { status: 404 });
      }
      
      const startTime = accessLog.accessStartTime;
      const endTime = new Date();
      const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
      
      // Atualizar o log de acesso com o horário de término e duração
      await prisma.documentAccessLog.update({
        where: {
          id: accessLog.id
        },
        data: {
          accessEndTime: endTime,
          duration: durationSeconds
        }
      });
      
      return NextResponse.json({ success: true, duration: durationSeconds });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid event type' });
  } catch (error) {
    console.error('Error logging document access:', error);
    return NextResponse.json({ success: false, error: 'Failed to log document access' }, { status: 500 });
  }
}
