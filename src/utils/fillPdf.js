import { border, borderColor, fontSize } from "@mui/system";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {employee_info} from "./gip_view_employee_pdf.js";
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
    { name, startDate, endDate, assignmentPlace, address, validId, validIdIssued },
) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;

    // Page 1:
    const firstPage = pages[0];
    drawWrappedText(firstPage, name, 45, 530, { font, size: fontSize, maxWidth: 150 });
    drawWrappedText(firstPage, address || "", 187, 537, { font, size: 8, maxWidth: 80 });
    drawWrappedText(firstPage, startDate, 280, 530, { font, size: fontSize });
    drawWrappedText(firstPage, endDate, 340, 530, { font, size: fontSize });
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

    /*
        const genderCheckBoxPos = {
        male: { x: 144, y: height - 308 },
        female: { x: 231, y: height - 308 },
    };
    const gender = data.gender ? data.gender.toLowerCase() : "";
    const checkSize = 14;
    switch (gender) {
        case "male":
            page.drawText("X", {
                x: genderCheckBoxPos.male.x,
                y: genderCheckBoxPos.male.y,
                size: checkSize,
                font,
                color: rgb(0, 0, 0),
            });
            break;
        case "female":
            page.drawText("X", {
                x: genderCheckBoxPos.female.x,
                y: genderCheckBoxPos.female.y,
                size: checkSize,
                font,
                color: rgb(0, 0, 0),
            });
            break;
        default:
            break;
    }

    const civilStatusCheckboxPos = {
        single: { x: 144, y: height - 328 },
        married: { x: 231, y: height - 326 },
        widowed: { x: 326, y: height - 328 },
    };

    const civilStatus = data.civilStatus ? data.civilStatus.toLowerCase() : "";
    switch (civilStatus) {
        case "single":
            page.drawText("X", {
                x: civilStatusCheckboxPos.single.x,
                y: civilStatusCheckboxPos.single.y,
                size: checkSize,
                font,
                color: rgb(0, 0, 0),
            });
            break;
        case "married":
            page.drawText("X", {
                x: civilStatusCheckboxPos.married.x,
                y: civilStatusCheckboxPos.married.y,
                size: checkSize,
                font,
                color: rgb(0, 0, 0),
            });
            break;
        case "widowed":
            page.drawText("X", {
                x: civilStatusCheckboxPos.widowed.x,
                y: civilStatusCheckboxPos.widowed.y,
                size: checkSize,
                font,
                color: rgb(0, 0, 0),
            });
            break;
    }
    const name = data.fullName ? data.fullName.toUpperCase() : "";
    page.drawText(name, {
        x: 45,
        y: height - 157,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.address, {
        x: 45,
        y: height - 205,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.contactNumber, {
        x: 90,
        y: height - 247,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.email, {
        x: 110,
        y: height - 261,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.birthDate, {
        x: 200,
        y: height - 292,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(data.collegeSchool, {
        x: 40,
        y: height - 392,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.collegeYear, {
        x: 345,
        y: height - 392,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.collegeDegree, {
        x: 409,
        y: height - 392,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.seniorHighSchool, {
        x: 40,
        y: height - 410,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.seniorHighYear, {
        x: 345,
        y: height - 410,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.seniorHighDegree, {
        x: 409,
        y: height - 410,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.secondarySchool, {
        x: 40,
        y: height - 428,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.secondaryYear, {
        x: 345,
        y: height - 428,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.secondaryDegree, {
        x: 409,
        y: height - 428,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.primarySchool, {
        x: 40,
        y: height - 448,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.primaryYear, {
        x: 345,
        y: height - 448,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.primaryDegree, {
        x: 409,
        y: height - 448,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(data.workCompany, {
        x: 40,
        y: height - 495,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.workPosition, {
        x: 220,
        y: height - 495,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.workPeriod, {
        x: 409,
        y: height - 495,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });

    if (data.pwd) {
        page.drawText("X", {
            x: 186,
            y: height - 547,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    if (data.iP) {
        page.drawText("X", {
            x: 237,
            y: height - 547,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    if (data.victimOfArmedConflict) {
        page.drawText("X", {
            x: 277,
            y: height - 547,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    if (data.rebelReturnee) {
        page.drawText("X", {
            x: 404,
            y: height - 547,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    if (data.fourP) {
        page.drawText("X", {
            x: 255,
            y: height - 566,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    if (data.othersDG) {
        page.drawText(data.othersDG, {
            x: 340,
            y: height - 564,
            size: 8,
            font,
            color: rgb(0, 0, 0),
        });
    }

    page.drawText(data.emergencyName, {
        x: 80,
        y: height - 705,
        size: 9,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.emergencyContact, {
        x: 115,
        y: height - 720,
        size: 9,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.emergencyAddress, {
        x: 85,
        y: height - 735,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.gsisName, {
        x: 390,
        y: height - 704,
        size: 9,
        font,
        color: rgb(0, 0, 0),
    });
    page.drawText(data.gsisRelationship, {
        x: 360,
        y: height - 720,
        size: 9,
        font,
        color: rgb(0, 0, 0),
    });

    if (data.birthCertificate) {
        page.drawText("X", {
            x: 50,
            y: height - 855,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    if (data.transcriptOfRecords) {
        page.drawText("X", {
            x: 50,
            y: height - 870,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    if (data.barangayCertificate) {
        page.drawText("X", {
            x: 50,
            y: height - 886,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    if (data.form137138) {
        page.drawText("X", {
            x: 224,
            y: height - 855,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    if (data.diploma) {
        page.drawText("X", {
            x: 224,
            y: height - 870,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    if (data.othersD) {
        page.drawText("X", {
            x: 224,
            y: height - 886,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    page.drawText(data.othersD, {
        x: 280,
        y: height - 886,
        size: 8,
        font,
        color: rgb(0, 0, 0),
    });
    if (data.othersD) {
        page.drawText("X", {
            x: 432,
            y: height - 855,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    }
    */

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
    const contentWidth = width - (padding * 2);
    const contentHeight = height - (padding * 2);
    const contentX = x + padding;

    // Wrap text into lines
    const lines = wrapText(text, font, fontSize, contentWidth);

    // Calculate total text block height
    const totalTextHeight = lines.length * lineHeight;

    // Calculate starting Y position based on vertical alignment
    let startY;
    if (verticalAlign === "top") {
        startY = y + height - padding - fontSize; // Start from top
    } else if (verticalAlign === "middle") {
        startY = y + (height + totalTextHeight) / 2 - fontSize;
    } else if (verticalAlign === "bottom") {
        startY = y + totalTextHeight + padding - fontSize;
    }

    // Draw each line
    lines.forEach((line, index) => {
        const yPosition = startY - (index * lineHeight);

        // Only draw if within frame bounds
        if (yPosition >= y && yPosition <= y + height) {
            const xPosition = alignText(line, font, fontSize, contentX, contentWidth, align);

            page.drawText(line, {
                x: xPosition,
                y: yPosition,
                size: fontSize,
                font: font,
                color: color,
            });
        }
    });

    return lines.length; // Return number of lines drawn
}

function wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

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
    employee_info.forEach(field => {
        if (field.id === "gender" || field.id === "civilStatus") {
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
                drawBorder: field.drawBorder || false,
                align: field.align || "left",
                verticalAlign: field.verticalAlign || "middle",
                padding: field.padding ?? 0,
                color: rgb(0, 0, 0),
                drawBorder: true,
            }
        );
    });
}

function handleSpecialField(page, data, field, checkFont, height) {
    if (field.id === "gender") {
        const genderValue = data.gender?.toLowerCase();
        const pos = field.genderPos[genderValue];
        if (pos) {
            drawCheckmark(page, pos.x, height - pos.y, checkFont, field.size);
        }
    } else if (field.id === "civilStatus") {
        const statusValue = data.civilStatus?.toLowerCase();
        const pos = field.civilStatusPos[statusValue];
        if (pos) {
            drawCheckmark(page, pos.x, height - pos.y, checkFont, field.size);
        }
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
