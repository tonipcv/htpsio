import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest } from "next/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export function generateTemporaryPassword(length: number = 8): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  
  // Garante pelo menos um número
  password += charset.slice(52)[Math.floor(Math.random() * 10)];
  
  // Garante pelo menos uma letra maiúscula
  password += charset.slice(26, 52)[Math.floor(Math.random() * 26)];
  
  // Garante pelo menos uma letra minúscula
  password += charset.slice(0, 26)[Math.floor(Math.random() * 26)];
  
  // Preenche o resto da senha
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Embaralha a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Extracts the client IP address from a Next.js request
 * Handles various headers including those from proxies and load balancers
 */
export function getClientIp(req: NextRequest): string | null {
  // Check for forwarded headers first (proxy/load balancer scenarios)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, the client IP is the first one
    return forwarded.split(',')[0].trim();
  }
  
  // Check other common headers
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  // No direct IP access in Next.js App Router
  // Tentativa de obter o IP a partir do cabeçalho de conexão
  const connection = req.headers.get('connection');
  
  // Como último recurso, retornamos um valor padrão
  return null;
}
