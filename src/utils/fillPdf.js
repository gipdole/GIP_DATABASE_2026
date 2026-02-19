import { border, borderColor, fontSize } from "@mui/system";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { employee_info } from "../constants/gip_view_employee_pdf.js";
/**
 * Helper to draw wrapped text in a pseudo text box.
 */
const drawWrappedText = (page, text, x, y, { font, size, maxWidth = 150, lineHeight = 12, color = rgb(0, 0, 0) }) => {
    const upperText = (text || "").toUpperCase();
    const words = upperText.split(" ");
    let line = "";
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
    { name, dateHired, dateEnded, assignmentPlace, address, validId, validIdIssued },
) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;

    // Page 1:
    const firstPage = pages[0];
    drawWrappedText(firstPage, name, 45, 530, { font, size: fontSize, maxWidth: 150 });
    drawWrappedText(firstPage, address || "", 187, 537, { font, size: 8, maxWidth: 80 });
    drawWrappedText(firstPage, dateHired, 280, 530, { font, size: fontSize });
    drawWrappedText(firstPage, dateEnded, 340, 530, { font, size: fontSize });
    drawWrappedText(firstPage, assignmentPlace || "", 400, 537, { font, size: 8, maxWidth: 80 });

    // Page 2: signatory name
    if (pages[1]) {
        drawWrappedText(pages[1], name, 70, 345, { font, size: fontSize, maxWidth: 200 });
    }

    // Page 3: signatory name + ID (stacked vertically)
    if (pages[2]) {
        drawWrappedText(pages[2], name, 90, 642, { font, size: fontSize, maxWidth: 200 });
        drawWrappedText(pages[2], validId || "", 280, 642, { font, size: fontSize, maxWidth: 200 });
        drawWrappedText(pages[2], validIdIssued || "", 418, 642, { font, size: fontSize, maxWidth: 200 });
    }

    return await pdfDoc.save();
};

// for viewing GIP informaiton
export async function fillGIPInfoPDF(pdfUrl, data) {
    const GIPPDF = await fetch(pdfUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(GIPPDF);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const checkFont = await pdfDoc.embedFont(StandardFonts.ZapfDingbats);
    const { width, height } = page.getSize();

    drawEmployeeInfo(page, data, font, checkFont, height);
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
}

/*
    These functions are used for displaying text within a frame on the pdf
*/
function drawTextInFrame(page, text, frame, options = {}) {
    const {
        font,
        fontSize = 8,
        lineHeight = fontSize * 1.25,
        color = rgb(0, 0, 0),
        align = "left",
        verticalAlign = "top",
        padding = 0,
        drawBorder = false,
        borderColor = rgb(0, 0, 0),
        borderWidth = 1,
        autoSize = true,        // Enable auto-sizing by default
        minFontSize = 6,        // Minimum font size when auto-sizing
    } = options;

    const { x, y, height, width } = frame;

    // Draw border if requested
    if (drawBorder) {
        page.drawRectangle({
            x: x,
            y: y,
            width: width,
            height: height,
            borderColor: borderColor,
            borderWidth: borderWidth,
        });
    }

    // Calculate content area (frame minus padding)
    const contentWidth = width - padding * 2;
    const contentHeight = height - padding * 2;
    const contentX = x + padding;

    // Auto-size if enabled
    let finalFontSize = fontSize;
    let finalLineHeight = lineHeight;
    let lines = [];

    if (autoSize) {
        const result = autoSizeText(text, font, fontSize, contentWidth, contentHeight, minFontSize);
        finalFontSize = result.fontSize;
        finalLineHeight = result.lineHeight;
        lines = result.lines;
    } else {
        lines = wrapText(text, font, finalFontSize, contentWidth);
    }

    // Calculate total text block height
    const totalTextHeight = lines.length * finalLineHeight;

    // Calculate starting Y position based on vertical alignment
    let startY;
    if (verticalAlign === "top") {
        startY = y + height - padding - finalFontSize; // Start from top
    } else if (verticalAlign === "middle") {
        startY = y + (height + totalTextHeight) / 2 - finalFontSize;
    } else if (verticalAlign === "bottom") {
        startY = y + totalTextHeight + padding - finalFontSize;
    }

    // Draw each line
    lines.forEach((line, index) => {
        const yPosition = startY - index * finalLineHeight;

        // Only draw if within frame bounds
        if (yPosition >= y && yPosition <= y + height) {
            const xPosition = alignText(line, font, finalFontSize, contentX, contentWidth, align);

            page.drawText(line, {
                x: xPosition,
                y: yPosition,
                size: finalFontSize,
                font: font,
                color: color,
            });
        }
    });

    return lines.length; // Return number of lines drawn
}


function wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxWidth && currentLine) {
            // Current line is full, start new line
            lines.push(currentLine);
            currentLine = word;
        } else {
            // Word fits, add it to current line
            currentLine = testLine;
        }
    }

    // Push the last line
    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

function autoSizeText(text, font, maxFontSize, maxWidth, maxHeight, minFontSize = 6) {
    let fontSize = maxFontSize;
    let lineHeight = fontSize * 1.25;
    let lines = [];

    // Try decreasing font sizes until text fits
    while (fontSize >= minFontSize) {
        lineHeight = fontSize * 1.25;
        lines = wrapText(text, font, fontSize, maxWidth);
        const totalHeight = lines.length * lineHeight;

        // Check if it fits
        if (totalHeight <= maxHeight) {
            // Also check if any individual line is too wide
            const allLinesFit = lines.every(line => 
                font.widthOfTextAtSize(line, fontSize) <= maxWidth
            );
            
            if (allLinesFit) {
                break; // Found a size that fits!
            }
        }

        fontSize -= 0.5; // Decrease font size
    }

    // Ensure we don't go below minimum
    if (fontSize < minFontSize) {
        fontSize = minFontSize;
        lineHeight = fontSize * 1.25;
        lines = wrapText(text, font, fontSize, maxWidth);
    }

    return { fontSize, lineHeight, lines };
}


function alignText(text, font, fontSize, startX, maxWidth, align) {
    if (align === "left") {
        return startX;
    }

    const textWidth = font.widthOfTextAtSize(text, fontSize);

    if (align === "center") {
        return startX + (maxWidth - textWidth) / 2;
    }

    if (align === "right") {
        return startX + maxWidth - textWidth;
    }

    return startX; // Default to left
}

function drawEmployeeInfo(page, data, font, checkFont, height) {
    employee_info.forEach((field) => {
        const hasPositions = field.genderPos || field.civilStatusPos;
        const isSimpleCheckbox = !field.width && field.x && field.y;
        const othersDCheck = field.id === "othersDCheck" && data.othersDG;

        if (hasPositions || isSimpleCheckbox || othersDCheck) {
            handleSpecialField(page, data, field, checkFont, height);
            return;
        }

        const value = data[field.id];
        if (!value) return;

        drawTextInFrame(
            page,
            value,
            {
                x: field.x,
                y: height - field.y,
                width: field.width || 150,
                height: field.height || 15,
            },
            {
                font: font,
                fontSize: field.size,
                padding: field.padding || 0,
                drawBorder: false, //field.drawBorder || false
                align: field.align || "left",
                verticalAlign: field.verticalAlign || "middle",
                padding: field.padding ?? 0,
                color: rgb(0, 0, 0),
            },
        );
    });
}

function handleSpecialField(page, data, field, checkFont, height) {
    if (field.genderPos) {
        const genderValue = data.gender?.toLowerCase();
        const pos = field.genderPos[genderValue];
        if (pos) {
            drawCheckmark(page, pos.x, height - pos.y, checkFont, field.size);
        }
    }
    if (field.civilStatusPos) {
        const statusValue = data.civilStatus?.toLowerCase();
        const pos = field.civilStatusPos[statusValue];
        if (pos) {
            drawCheckmark(page, pos.x, height - pos.y, checkFont, field.size);
        }
    }
    if (field.id === "othersDCheck" && data.othersDG && data.othersDG !== "N/A") {
        drawCheckmark(page, field.x, height - field.y, checkFont, field.size);
    }
    const isChecked = data[field.id];
    if (isChecked === true) {
        drawCheckmark(page, field.x, height - field.y, checkFont, field.size);
    }
}

// Helper function to draw checkmark or X
function drawCheckmark(page, x, y, checkFont, size) {
    page.drawText("\u2713", {
        x: x,
        y: y,
        size: size,
        font: checkFont,
        color: rgb(0, 0, 0),
    });
}
