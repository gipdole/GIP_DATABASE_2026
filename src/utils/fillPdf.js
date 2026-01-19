import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Helper to draw wrapped text in a pseudo text box.
 */
const drawWrappedText = (
  page,
  text,
  x,
  y,
  { font, size, maxWidth = 150, lineHeight = 12, color = rgb(0, 0, 0) }
) => {
  const upperText = (text || '').toUpperCase();
  const words = upperText.split(' ');
  let line = '';
  const lines = [];

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, size);
    if (width <= maxWidth) {
      line = testLine;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);

  lines.slice(0, 3).forEach((lineText, i) => {
    page.drawText(lineText, {
      x,
      y: y - i * lineHeight,
      size,
      font,
      color,
    });
  });
};

/**
 * Fill the static contract template with provided employee data.
 */
export const fillPdf = async (
  pdfBytes,
  { name, startDate, endDate, assignmentPlace, address, validId, validIdIssued }
) => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;

  const firstPage = pages[0];
  drawWrappedText(firstPage, name, 70, 530, { font, size: fontSize, maxWidth: 150 });
  drawWrappedText(firstPage, address || '', 200, 537, { font, size: 8, maxWidth: 80 });
  drawWrappedText(firstPage, startDate, 300, 530, { font, size: fontSize });
  drawWrappedText(firstPage, endDate, 365, 530, { font, size: fontSize });
  drawWrappedText(firstPage, assignmentPlace || '', 422, 537, {
    font,
    size: 8,
    maxWidth: 65,
  });

  // Page 2: signatory name
  if (pages[1]) {
    drawWrappedText(pages[1], name, 95, 308, { font, size: fontSize, maxWidth: 200 });
  }

  // Page 3: signatory name + ID (stacked vertically)
  if (pages[2]) {
    drawWrappedText(pages[2], name, 85, 564, { font, size: fontSize, maxWidth: 200 });
    drawWrappedText(pages[2], validId || '', 266, 564, { font, size: fontSize, maxWidth: 200 });
    drawWrappedText(pages[2], validIdIssued || '', 418, 564, { font, size: fontSize, maxWidth: 200 });
  }

  return await pdfDoc.save();
};
