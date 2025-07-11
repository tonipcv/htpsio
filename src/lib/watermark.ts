import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function addWatermark(
  pdfBuffer: Buffer,
  text: string,
  options = {
    fontSize: 8,  // Reduzido de 12 para 8
    opacity: 0.15,  // Reduzido para 15% de opacidade
    angle: -45,
    color: { r: 0.5, g: 0.5, b: 0.5 } // cinza
  }
) {
  try {
    // Carregar o PDF original
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Carregar a fonte
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Obter todas as páginas
    const pages = pdfDoc.getPages();
    
    // Para cada página, adicionar a marca d'água
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Calcular o tamanho do texto
      const textWidth = helveticaFont.widthOfTextAtSize(text, options.fontSize);
      const textHeight = helveticaFont.heightAtSize(options.fontSize);
      
      // Calcular o tamanho diagonal do texto (quando rotacionado)
      const diagonalLength = Math.sqrt(textWidth * textWidth + textHeight * textHeight);
      
      // Definir posições para cobrir a página com marcas d'água
      const spacingX = diagonalLength * 2;  // Espaçamento baseado no tamanho diagonal
      const spacingY = diagonalLength * 2;  // Espaçamento igual em ambas direções
      
      // Calcular quantas marcas d'água precisamos em cada direção
      // Adicionar margem extra para evitar cortes
      const numRows = Math.ceil(height / spacingY) + 2;  // +2 para margem
      const numCols = Math.ceil(width / spacingX) + 2;   // +2 para margem
      
      // Calcular o offset inicial para centralizar o padrão
      // Ajustado para começar antes da borda da página
      const startX = -spacingX;
      const startY = -spacingY;
      
      // Criar um padrão de grade para as marcas d'água
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          const x = startX + col * spacingX;
          const y = startY + row * spacingY;
          
          // Desenhar o texto com opacidade e rotação
          // Posicionamento ajustado para considerar a rotação
          page.drawText(text, {
            x: x + (width / 2),
            y: y + (height / 2),
            size: options.fontSize,
            font: helveticaFont,
            opacity: options.opacity,
            color: rgb(options.color.r, options.color.g, options.color.b),
            rotate: degrees(options.angle)
          });
        }
      }
    }
    
    // Gerar o PDF final
    const watermarkedPdfBytes = await pdfDoc.save();
    
    return Buffer.from(watermarkedPdfBytes);
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw error;
  }
} 