// lib/pdfGenerator.ts
"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { 
    Invoice, 
    Client, 
    CompanyInfo, 
    Payroll, 
    Employee, 
    User, 
    TimeLog, 
    Payment, 
    DeliveryNote, 
    Order, 
    Quote,
    Prestation,
    JuridicState
} from "@prisma/client";
import { poppinsNormal, poppinsBold } from "./fonts";

type DocType = 'FACTURE' | 'BON DE LIVRAISON' | 'DEVIS' | 'FICHE DE PAIE' | 'RAPPORT';

type AnyItem = {
  designation: string;
  quantity?: string | number | null;
  unitPrice?: string | number | null;
  total?: number | null;
  qte?: number | null;
  pu_ht?: number | null;
  total_ht?: number | null;
  qteCommandee?: number | string | null;
  qteLivree?: number | string | null;
};

// Types complets pour toutes les fonctionnalités
type FullInvoice = Invoice & { client: Client; order: Order & { quote: Quote | null } };
type FullDeliveryNote = DeliveryNote & { order: Order & { client: Client } };
type FullQuote = Quote & { client: Client; prestation: Prestation | null };
type FullTimeLog = TimeLog & { mission: { order: { client: { nom: string } } } };
type FullEmployeeForPayroll = Employee & { user: User | null };
type FullPayroll = Payroll & {
  employee: FullEmployeeForPayroll;
  timeLogs: FullTimeLog[];
  payments: Payment[];
};

// Fonctions utilitaires
const formatDate = (date: Date) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleDateString('fr-FR', { month: 'long' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatCurrency = (amount: number | string | null | undefined) => {
  const parsedAmount = typeof amount === 'string' ? parseFloat(amount.replace(',', '.')) : amount;
  if (typeof parsedAmount !== 'number' || isNaN(parsedAmount)) return "N/A";
  return `${(parsedAmount || 0).toFixed(2).replace('.', ',')} MAD`;
};

const formatDuration = (minutes: number | null) => {
  if (!minutes && minutes !== 0) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}min`;
};

const toStr = (val: any): string => String(val ?? '');

function numberToWords(n: number, isTTC: boolean): string {
    if (n === 0) return "zéro";
    const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];
    const toWords = (num: number): string => {
        if (num === 0) return "";
        let words = "";
        if (num >= 1000000) { words += toWords(Math.floor(num / 1000000)) + " million" + (Math.floor(num / 1000000) > 1 ? "s " : " "); num %= 1000000; }
        if (num >= 1000) {
            const thousands = Math.floor(num / 1000);
            if (thousands > 1) { words += toWords(thousands) + " mille "; } else { words += "mille "; }
            num %= 1000;
        }
        if (num >= 100) {
            const hundreds = Math.floor(num / 100);
            if (hundreds > 1) { words += toWords(hundreds) + " cent" + (num % 100 === 0 ? "s " : " ");
            } else { words += "cent "; }
            num %= 100;
        }
        if (num >= 20) {
            const ten = Math.floor(num / 10);
            words += tens[ten];
            const unit = num % 10;
            if (unit === 1 && ten < 8) { words += " et un";
            } else if (unit > 0) { words += "-" + units[unit]; }
        } else if (num >= 10) { words += teens[num - 10];
        } else if (num > 0) { words += units[num]; }
        return words.trim() + " ";
    };
    const [integerPart, decimalPart] = n.toFixed(2).split('.').map(part => parseInt(part, 10));
    let result = toWords(integerPart).trim();
    result = result.charAt(0).toUpperCase() + result.slice(1) + " Dirham" + (integerPart > 1 ? "s" : "");
    if (decimalPart > 0) { result += " et " + toWords(decimalPart).trim() + " centime" + (decimalPart > 1 ? "s" : ""); }
    result += isTTC ? ", toutes taxes comprises" : ", hors taxes";
    return result;
}


// --- Fonctions de dessin ---

function drawHeader(doc: jsPDF, docType: DocType, docNumber: string, date: Date, options?: { orderRef?: string, period?: string }) {
    try {
        doc.addFileToVFS('Poppins-Regular.ttf', poppinsNormal);
        doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal');
        doc.addFileToVFS('Poppins-Bold.ttf', poppinsBold);
        doc.addFont('Poppins-Bold.ttf', 'Poppins', 'bold');
    } catch(e) { 
        console.warn("Erreur lors du chargement des polices:", e);
        doc.setFont('helvetica');
    }
 
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("Poppins", "bold");
    doc.setFontSize(34);
    doc.text(docType, 15, 24);
    doc.setFont("Poppins", "bold");
    doc.setFontSize(9);
    doc.text(`DOCUMENT CREE LE : ${formatDate(date)}`, 15, 30);
    doc.text(`NUMERO DOCUMENT : ${docNumber}`, 15, 35);
    if (options?.orderRef) { doc.text(`N ° BON DE COMMANDE : ${options.orderRef}`, 15, 40); } 
    else if (options?.period) { doc.text(`PERIODE : ${options.period}`, 15, 40); }
    
    doc.setFont("Poppins", "bold");
    doc.setFontSize(40);
    doc.setCharSpace(-0.5);
    doc.text("enarva", 148, 29);
    doc.setCharSpace(0);
}

function drawCompanyInfo(doc: jsPDF, client: Client, orderedBy?: string) {
    const startY = 60;
    doc.setTextColor(0, 0, 0);
    doc.setFont("Poppins", "bold");
    doc.setFontSize(11);
    doc.text("ENARVA SARL AU", 15, startY);
    doc.setFont("Poppins", "normal");
    doc.setFontSize(10);
    doc.text("53 ,2ème étage, Appartement", 15, startY + 5);
    doc.text("15, Av. Brahim Roudani", 15, startY + 10);
    doc.text("Océan, Rabat - Maroc", 15, startY + 15);
    doc.setFont("Poppins", "bold");
    doc.setFontSize(11);
    doc.text(client.nom, 195, startY,{ align: 'right' });
    doc.setFont("Poppins", "normal");
    doc.setFontSize(10);
    if (client.adresse) {
        const addressLines = doc.splitTextToSize(client.adresse, 80);
        doc.text(addressLines, 195, startY + 5, { align: 'right' });
    }
    if (orderedBy) {
        doc.setFont("Poppins", "bold");
        doc.text(`Commandé par : ${orderedBy}`, 195, startY + 30, { align: 'right' });
    }
}

function drawPrestationDetails(doc: jsPDF, quote: FullQuote, startY: number): number {
    let currentY = startY;
    const leftMargin = 15;
    const bulletIndent = 20;
    const lineSpacing = 5;
    const sectionSpacing = 8;
    const maxWidth = 180;

    // FIX: "Objet du devis" sur une seule ligne avec styles mixtes.
    doc.setFont("Poppins", "bold");
    doc.setFontSize(10);
    const objectTitle = "Objet du Devis :";
    doc.text(objectTitle, leftMargin, currentY);

    doc.setFont("Poppins", "normal");
    const titleWidth = doc.getTextWidth(objectTitle);
    doc.text(toStr(quote.object), leftMargin + titleWidth + 2, currentY);
    currentY += lineSpacing + sectionSpacing;


    const drawSection = (title: string, content: string | null | undefined, isBulleted: boolean) => {
        if (!content || content.trim() === '') return;

        doc.setFont("Poppins", "bold");
        doc.setFontSize(10);
        doc.text(title, leftMargin, currentY);
        currentY += lineSpacing;

        doc.setFont("Poppins", "normal");
        const processedContent = content.replace(/\s*-\s*/g, '\n');
        const lines = processedContent.split('\n').filter(line => line.trim() !== '');

        lines.forEach(line => {
            const textToDraw = line.trim();
            const textLines = doc.splitTextToSize(textToDraw, maxWidth - (isBulleted ? (bulletIndent - leftMargin) : 0));
            
            if (isBulleted) {
                doc.text('•', leftMargin, currentY);
                doc.text(textLines, bulletIndent, currentY);
            } else {
                doc.text(textLines, leftMargin, currentY);
            }
            currentY += doc.getTextDimensions(textLines).h + 1;
        });
        currentY += sectionSpacing - 1;
    };
    
    if (quote.prestation) {
        currentY += 5;
        doc.setFont("Poppins", "bold");
        doc.setFontSize(11);
        doc.text("Détails de la Prestation", leftMargin, currentY);
        doc.setLineWidth(0.2);
        doc.line(leftMargin, currentY + 1.5, leftMargin + 45, currentY + 1.5);
        currentY += sectionSpacing + 2;

        drawSection("Personnel mobilisé :", quote.prestation.personnelMobilise, true);
        drawSection("Équipements et produits utilisés :", quote.prestation.equipementsUtilises, true);
        drawSection("Prestations incluses :", quote.prestation.prestationsIncluses, true);
        drawSection("Délai prévu de la prestation :", quote.prestation.delaiPrevu, false);
    }
    
    return currentY;
}

function drawTotalsForQuoteOrInvoice(doc: jsPDF, totals: { totalHT: number, tva: number, totalTTC: number, juridicState: JuridicState }, startY: number): number {
    const rightAlignX = 195;
    const labelX = rightAlignX - 60;
    const totalsY = startY + 10;
    const textBlockWidth = labelX - 25;

    const isLegal = totals.juridicState === 'LEGAL';
    const totalToConvert = isLegal ? totals.totalTTC : totals.totalHT;
    const amountInWordsText = `Veuillez arrêter le présent devis à la somme de ${numberToWords(totalToConvert, isLegal)}.`;

    const splitText = doc.splitTextToSize(amountInWordsText, textBlockWidth);
    doc.setFont("Poppins", "bold");
    doc.setFontSize(10);
    doc.text(splitText, 15, totalsY);

    doc.setFont("Poppins", "normal");
    doc.setFontSize(10);

    let currentY = totalsY;
    
    doc.text("Total HT", labelX, currentY);
    doc.text(formatCurrency(totals.totalHT), rightAlignX, currentY, { align: 'right' });
    currentY += 7;

    if (isLegal) {
        doc.text("TVA (20%)", labelX, currentY);
        doc.text(formatCurrency(totals.tva), rightAlignX, currentY, { align: 'right' });
        currentY += 5;

        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.3);
        doc.line(labelX, currentY, rightAlignX, currentY);
        currentY += 5;

        doc.setFont("Poppins", "bold");
        doc.text("TOTAL TTC", labelX, currentY);
        doc.text(formatCurrency(totals.totalTTC), rightAlignX, currentY, { align: 'right' });
    }
    
    const textHeight = doc.getTextDimensions(splitText).h;
    return Math.max(currentY, totalsY + textHeight);
}


function drawFooter(doc: jsPDF, companyInfo: CompanyInfo, startY: number, docType: DocType) {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftMargin = 15;
    const rightMargin = pageWidth - 15;

    let contentStartY = startY + 15;

    // --- NOUVELLE LOGIQUE DYNAMIQUE POUR LES OBSERVATIONS ---
    let observationsTitle = "";
    let observationsLines: string[] = [];

    if (docType === 'FACTURE') {
        observationsTitle = "Observations générales :";
        observationsLines = [
            "Toute réclamation doit être signalée sous 48h après la livraison.",
            "Les marchandises voyagent aux risques et périls du destinataire.",
            "La présente facture vaut titre exécutoire en cas de non-paiement."
        ];
    } else if (docType === 'BON DE LIVRAISON') {
        observationsTitle = "Observations générales :";
        observationsLines = [
            "Toute réclamation doit être signalée sous 48h après la livraison.",
            "La livraison a été effectuée selon le bon de commande.",
            "Le client s'engage à vérifier la conformité avant de signer."
        ];
    } else if (docType === 'DEVIS') {
        observationsTitle = "Conditions de paiement :";
        observationsLines = [
            "Les règlements peuvent être effectués par virement bancaire, par chèque ou en espèces.",
            "Échelonnement du Paiement: 30% à l'initiation du travail et 50% à la livraison."
        ];
    }

    // Affichage de la section si des observations sont définies
    if (observationsTitle && observationsLines.length > 0) {
        doc.setFont("Poppins", "bold");
        doc.setFontSize(10);
        doc.text(observationsTitle, leftMargin, contentStartY);
        contentStartY += 6; // Espace après le titre

        doc.setFont("Poppins", "normal");
        doc.setFontSize(9);
        
        // Boucle pour afficher chaque ligne en tant que puce
        observationsLines.forEach(line => {
            const splitLines = doc.splitTextToSize(line, pageWidth - (leftMargin * 2) - 5);
            doc.text(`•`, leftMargin, contentStartY, { align: 'left' });
            doc.text(splitLines, leftMargin + 5, contentStartY);
            // Calcule la hauteur du texte pour ajuster la position Y pour la prochaine ligne
            const textDimensions = doc.getTextDimensions(splitLines);
            contentStartY += textDimensions.h + 2;
        });
    }
    // --- FIN DE LA NOUVELLE LOGIQUE ---


    const separatorY = pageHeight - 20;
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, separatorY, rightMargin, separatorY);

    const infoY = separatorY + 8;

    doc.setFont("Poppins", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.setCharSpace(-0.2);
    doc.text("enarva", leftMargin, infoY);
    doc.setCharSpace(0);

    const { rc = 'N/A', if: ifo = 'N/A', ice = 'N/A' } = companyInfo;
    const companyDetails = `RC: ${rc} | IF: ${ifo} | ICE: ${ice}`;
    
    doc.setFont("Poppins", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text(companyDetails, rightMargin, infoY, { align: 'right' });
    
    const address = "53, 2ème étage, Appartement 15, Av. Brahim Roudani, Océan, Rabat";
    const contact = "contact@enarva.com | 06 38 146-573";
    
    doc.text(address, rightMargin, infoY + 4, { align: 'right' });
    doc.text(contact, rightMargin, infoY + 8, { align: 'right' });
}


// --- Fonctions d'export ---

export function generateQuotePDF(quote: FullQuote, companyInfo: CompanyInfo) {
    const doc = new jsPDF();
    const items = quote.items as AnyItem[];
    
    drawHeader(doc, 'DEVIS', quote.quoteNumber, quote.date);
    drawCompanyInfo(doc, quote.client);
    
    let currentY = drawPrestationDetails(doc, quote, 85);
    
    const hasItems = items && items.length > 0 && !(items.length === 1 && items[0].designation === "" && items[0].total === 0);

    if (hasItems) {
        let tableHeight = 0;
        autoTable(doc, {
            startY: currentY,
            head: [items.map(i => i.designation)],
            body: items.map(i => [
                toStr(i.designation), 
            ]),
            styles: { font: "Poppins", fontSize: 9, cellPadding: 3 },
            didDrawPage: () => {},
            willDrawCell: () => false,
            didParseCell: (data) => {
                if (data.cursor) {
                    tableHeight = data.cursor.y - currentY;
                }
            }
        });
        
        const pageHeight = doc.internal.pageSize.getHeight();
        const footerAreaHeight = 40; 
        const totalsHeight = 60;
        const observationsHeight = 35; 
        const requiredSpace = tableHeight + totalsHeight + observationsHeight;
        const availableSpace = pageHeight - footerAreaHeight - currentY;

        if (requiredSpace > availableSpace) {
            doc.addPage();
            currentY = 20; 
        }

        autoTable(doc, {
            startY: currentY,
            head: [['Désignation', 'Quantité', 'Prix Unitaire', 'Total HT']],
            body: items.map(item => [
                toStr(item.designation),
                toStr(item.quantity ?? item.qte),
                formatCurrency(typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.pu_ht),
                formatCurrency(item.total ?? item.total_ht)
            ]),
            theme: 'grid',
            styles: { font: "Poppins", fontSize: 9, cellPadding: 3, lineColor: [229, 231, 235], lineWidth: 0.1 },
            headStyles: { font: "Poppins", fontStyle: 'bold', fillColor: [243, 244, 246], textColor: [0, 0, 0] },
            columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
        });
        currentY = (doc as any).lastAutoTable.finalY;
    } else {
        doc.setFont("Poppins", "bold");
        doc.text("Prix forfaitaire :", 15, currentY);
        currentY += 10;
    }

    currentY = drawTotalsForQuoteOrInvoice(doc, quote, currentY);
    drawFooter(doc, companyInfo, currentY, 'DEVIS'); 
    
    doc.save(`Devis-${quote.quoteNumber.replace(/\//g, '-')}.pdf`);
}

export function generateInvoicePDF(invoice: FullInvoice, companyInfo: CompanyInfo) {
    const doc = new jsPDF();
    const items = invoice.items as AnyItem[];
    const orderRef = invoice.order.refCommande || invoice.order.quote?.quoteNumber;
    
    drawHeader(doc, 'FACTURE', invoice.invoiceNumber, invoice.date, { orderRef });
    drawCompanyInfo(doc, invoice.client, invoice.order.orderedBy ?? undefined);
    
    autoTable(doc, {
        startY: 95,
        head: [['Désignation', 'Qté', 'P.U.', 'Total HT']],
        body: items.map(item => [
            toStr(item.designation),
            toStr(item.quantity ?? item.qte),
            formatCurrency(typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.pu_ht),
            formatCurrency(item.total ?? item.total_ht)
        ]),
        theme: 'grid',
        styles: { font: "Poppins", fontSize: 9, cellPadding: 3 },
        headStyles: { font: "Poppins", fontStyle: 'bold', fillColor: [243, 244, 246], textColor: [0, 0, 0] },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY;
    const invoiceTotals = { ...invoice, juridicState: 'LEGAL' as JuridicState };
    const totalsY = drawTotalsForQuoteOrInvoice(doc, invoiceTotals, finalY);
    drawFooter(doc, companyInfo, totalsY, 'FACTURE');
    
    doc.save(`Facture-${invoice.invoiceNumber.replace(/\//g, '-')}.pdf`);
}

export function generateDeliveryNotePDF(deliveryNote: FullDeliveryNote, companyInfo: CompanyInfo) {
    const doc = new jsPDF();
    const items = deliveryNote.items as AnyItem[];
    drawHeader(doc, 'BON DE LIVRAISON', deliveryNote.deliveryNoteNumber, deliveryNote.date, { orderRef: deliveryNote.order.refCommande ?? undefined });
    drawCompanyInfo(doc, deliveryNote.order.client, deliveryNote.order.orderedBy ?? undefined);
    
    autoTable(doc, {
        startY: 95,
        head: [['Désignation', 'Qté Commandée', 'Qté Livrée', 'Observations']],
        body: items.map(item => [
            toStr(item.designation),
            toStr(item.qteCommandee ?? item.quantity ?? item.qte),
            toStr(item.qteLivree ?? item.quantity ?? item.qte),
            'Conforme'
        ]),
        theme: 'grid',
        headStyles: { font: "Poppins", fontStyle: 'bold', fillColor: [243, 244, 246], textColor: [0, 0, 0] },
        styles: { font: "Poppins", fontSize: 9, cellPadding: 3 },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } }
    });

    const lastTable = (doc as any).lastAutoTable;
    let finalY = 95;
    if (lastTable) {
        finalY = lastTable.finalY + 20;
        doc.setFont("Poppins", "normal"); doc.setFontSize(10);
        doc.text("Signature du client :", 15, finalY);
        doc.text("Signature du livreur :", 120, finalY);
    }
    
    drawFooter(doc, companyInfo, finalY, 'BON DE LIVRAISON');
    doc.save(`BL-${deliveryNote.deliveryNoteNumber.replace(/\//g, '-')}.pdf`);
}

export function generatePayslipPDF(payroll: FullPayroll, companyInfo: CompanyInfo) {
    const doc = new jsPDF();
    const period = `${new Date(payroll.periodStart).toLocaleDateString('fr-FR')} au ${new Date(payroll.periodEnd).toLocaleDateString('fr-FR')}`;
    const payrollNumber = payroll.payrollNumber || `PAIE-${payroll.id.slice(-4)}`;

    drawHeader(doc, 'FICHE DE PAIE', payrollNumber, new Date(), { period });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("Poppins", "bold");
    doc.text("Employé(e):", 15, 70);
    doc.setFont("Poppins", "normal");
    doc.text(`${payroll.employee.user?.name || `${payroll.employee.firstName} ${payroll.employee.lastName}`}`, 45, 70);
    
    autoTable(doc, {
        startY: 80,
        head: [['Date', 'Mission (Client)', 'Durée', 'Gains']],
        body: payroll.timeLogs.map(log => [
            new Date(log.startTime).toLocaleDateString('fr-FR'),
            `Mission chez ${log.mission.order.client.nom}`,
            formatDuration(log.duration),
            formatCurrency(log.earnings)
        ]),
        theme: 'grid',
        headStyles: { font: "Poppins", fontStyle: 'bold', fillColor: [243, 244, 246], textColor: [0, 0, 0] },
        styles: { font: "Poppins", fontSize: 9, cellPadding: 3 },
        columnStyles: { 2: { halign: 'center' }, 3: { halign: 'right' } }
    });

    let currentY = (doc as any).lastAutoTable.finalY;
    if (payroll.payments.length > 0) {
        autoTable(doc, {
            startY: currentY + 10,
            head: [['Date du Paiement', 'Type', 'Montant']],
            body: payroll.payments.map(p => [
                new Date(p.date).toLocaleDateString('fr-FR'),
                toStr(p.type),
                formatCurrency(p.amount)
            ]),
            theme: 'grid',
            headStyles: { font: "Poppins", fontStyle: 'bold', fillColor: [243, 244, 246], textColor: [0, 0, 0] },
            styles: { font: "Poppins", fontSize: 9, cellPadding: 3 },
            columnStyles: { 2: { halign: 'right' } }
        });
        currentY = (doc as any).lastAutoTable.finalY;
    }

    const finalY = currentY + 15;
    doc.setFontSize(10);
    doc.setFont("Poppins", "normal");
    doc.text("Total Gains:", 140, finalY, { align: 'right' });
    doc.text(formatCurrency(payroll.totalDue), 195, finalY, { align: 'right' });
    doc.text("Total Avances/Paiements:", 140, finalY + 7, { align: 'right' });
    doc.text(`- ${formatCurrency(payroll.totalPaid)}`, 195, finalY + 7, { align: 'right' });
    
    doc.setLineWidth(0.3);
    doc.line(140, finalY + 12, 195, finalY + 12);
    
    doc.setFont("Poppins", "bold");
    doc.setFontSize(12);
    doc.text("Net à Payer:", 140, finalY + 18, { align: 'right' });
    doc.text(formatCurrency(payroll.balance), 195, finalY + 18, { align: 'right' });
    
    drawFooter(doc, companyInfo, finalY + 20, 'FICHE DE PAIE');
    doc.save(`FicheDePaie-${payrollNumber.replace(/\//g, '-')}.pdf`);
}

export function generateInvoiceReportPDF(invoices: FullInvoice[], startDate: string, endDate: string, companyInfo: CompanyInfo) {
    const doc = new jsPDF();
    const period = `Du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`;
    drawHeader(doc, 'RAPPORT', "Rapport de Facturation", new Date(), { period });
    
    const tableData = invoices.map(invoice => [
        invoice.invoiceNumber,
        invoice.client.nom,
        new Date(invoice.date).toLocaleDateString('fr-FR'),
        formatCurrency(invoice.totalTTC),
    ]);
    const total = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
    
    autoTable(doc, {
        startY: 65,
        head: [['Facture N°', 'Client', 'Date', 'Total TTC']],
        body: tableData,
        theme: 'grid',
        headStyles: { font: "Poppins", fontStyle: 'bold', fillColor: [243, 244, 246], textColor: [0, 0, 0] },
        styles: { font: "Poppins", fontSize: 9 },
        columnStyles: { 3: { halign: 'right' } },
        didDrawPage: (data) => {
            const pageCount = (doc.internal as any).getNumberOfPages();
            if (data.pageNumber === pageCount && data.cursor) {
                doc.setFont('Poppins', 'bold');
                doc.setFontSize(10);
                const rightEdge = doc.internal.pageSize.getWidth() - data.settings.margin.right;
                 doc.text('Total pour la période:', data.settings.margin.left, data.cursor.y + 10);
                doc.text(formatCurrency(total), rightEdge, data.cursor.y + 10, { align: 'right' });
            }
        }
    });

    drawFooter(doc, companyInfo, (doc as any).lastAutoTable.finalY + 20, 'RAPPORT');
    doc.save(`Rapport-Factures-${startDate}-au-${endDate}.pdf`);
}