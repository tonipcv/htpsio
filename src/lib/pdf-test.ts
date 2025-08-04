export function isPDFCorrupted(buffer: Buffer): boolean {
  try {
    // Verificar se o arquivo começa com %PDF
    const pdfHeader = buffer.slice(0, 4).toString();
    if (pdfHeader !== '%PDF') {
      console.log("❌ PDF header missing or incorrect:", pdfHeader);
      return true;
    }

    // Verificar se o arquivo termina com %EOF (mais flexível)
    // Examina os últimos 20 bytes para encontrar qualquer variação do marcador EOF
    const lastBytes = buffer.slice(-20).toString().trim();
    if (!lastBytes.includes('%EOF')) {
      console.log("❌ PDF footer missing or incorrect:", lastBytes);
      return true;
    }

    // Verificar tamanho mínimo (um PDF válido deve ter pelo menos alguns bytes)
    if (buffer.length < 100) {
      console.log("❌ PDF file too small:", buffer.length, "bytes");
      return true;
    }

    console.log("✅ PDF basic structure appears valid");
    return false;
  } catch (error) {
    console.error("❌ Error checking PDF structure:", error);
    return true;
  }
} 