import { borderColor } from "@mui/system";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { GIPApplicationFormFrames } from "../constants/GIPApplicationFrames";

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
    const { width, height } = page.getSize();

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
    page.drawText(data.fullName, {
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

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
}

/*
    These functions are used for displaying text within a frame on the pdf
*/
