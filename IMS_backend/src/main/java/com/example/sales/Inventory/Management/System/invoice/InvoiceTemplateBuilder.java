package com.example.sales.Inventory.Management.System.invoice;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.awt.Color;  
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

public class InvoiceTemplateBuilder {

    private static final Logger log = LoggerFactory.getLogger(InvoiceTemplateBuilder.class);

    private static final Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.WHITE);
    private static final Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
    private static final Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(31, 41, 55));
    private static final Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(75, 85, 99));
    private static final Font fontSmall = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(156, 163, 175));

    public static byte[] buildPdf(Invoice invoice) throws Exception {
        log.info("Building PDF for invoice number: {}", invoice.getInvoiceNo());
        
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, out);

        // Add Watermark Event if Invoice is Cancelled
        if ("CANCELLED".equalsIgnoreCase(invoice.getStatus())) {
            writer.setPageEvent(new WatermarkPageEvent("CANCELLED"));
        } else {
            writer.setPageEvent(new WatermarkPageEvent("")); // Empty means no watermark
        }

        document.open();

        // 1. Header Section
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{60, 40});

        PdfPCell logoCell = new PdfPCell();
        logoCell.setBackgroundColor(new Color(79, 70, 229)); // Indigo/Primary
        logoCell.setPadding(20);
        logoCell.setBorder(Rectangle.NO_BORDER);

        Paragraph logoPara = new Paragraph("LogiTrack", fontTitle);
        logoPCellFormatting(logoCell, logoPara);
        headerTable.addCell(logoCell);

        PdfPCell metaCell = new PdfPCell();
        metaCell.setBackgroundColor(new Color(79, 70, 229)); // Indigo/Primary
        metaCell.setPadding(20);
        metaCell.setBorder(Rectangle.NO_BORDER);
        metaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph invNumPara = new Paragraph("INVOICE\n#" + invoice.getInvoiceNo(), fontTitle);
        invNumPara.setAlignment(Element.ALIGN_RIGHT);
        metaCell.addElement(invNumPara);
        headerTable.addCell(metaCell);

        document.add(headerTable);

        // Spacer
        document.add(new Paragraph(" "));

        // 2. Info Block (Company & Customer details)
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{50, 50});

        // Left Column - Company Info
        PdfPCell companyCell = new PdfPCell();
        companyCell.setBorder(Rectangle.NO_BORDER);
        companyCell.setPadding(10);
        
        Paragraph compTitle = new Paragraph("LogiTrack Logistics Inc.", fontBold);
        Paragraph compDetails = new Paragraph(
                "100 Enterprise Way, Suite 400\n" +
                "Tech City, TC 94016\n" +
                "Email: support@logitrack.com\n" +
                "Phone: +1 (555) 019-2834",
                fontNormal
        );
        companyCell.addElement(compTitle);
        companyCell.addElement(compDetails);
        infoTable.addCell(companyCell);

        // Right Column - Customer Info
        PdfPCell customerCell = new PdfPCell();
        customerCell.setBorder(Rectangle.NO_BORDER);
        customerCell.setPadding(10);

        Paragraph custTitle = new Paragraph("BILL TO:", fontBold);
        String phoneStr = (invoice.getCustomerPhone() != null && !invoice.getCustomerPhone().isBlank()) 
                ? "\nPhone: " + invoice.getCustomerPhone() : "";
        String emailStr = (invoice.getCustomerEmail() != null && !invoice.getCustomerEmail().isBlank()) 
                ? "\nEmail: " + invoice.getCustomerEmail() : "";
        String billingAddress = (invoice.getBillingAddress() != null && !invoice.getBillingAddress().isBlank()) 
                ? "\nAddress: " + invoice.getBillingAddress() : "";
        
        Paragraph custDetails = new Paragraph(
                invoice.getCustomerName() + 
                phoneStr + 
                emailStr + 
                billingAddress,
                fontNormal
        );
        customerCell.addElement(custTitle);
        customerCell.addElement(custDetails);
        infoTable.addCell(customerCell);

        document.add(infoTable);

        // Spacer
        document.add(new Paragraph(" "));

        // 3. Invoice Metadata (Date, Status, Payments)
        PdfPTable metaDataTable = new PdfPTable(5);
        metaDataTable.setWidthPercentage(100);
        metaDataTable.setWidths(new float[]{20, 20, 20, 20, 20});

        addMetaHeaderCell(metaDataTable, "Invoice Date");
        addMetaHeaderCell(metaDataTable, "Payment Method");
        addMetaHeaderCell(metaDataTable, "Payment Status");
        addMetaHeaderCell(metaDataTable, "Invoice Status");
        addMetaHeaderCell(metaDataTable, "Due Date");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        addMetaValueCell(metaDataTable, invoice.getInvoiceDate().format(formatter));
        addMetaValueCell(metaDataTable, invoice.getPaymentMethod());
        addMetaValueCell(metaDataTable, invoice.getPaymentStatus());
        
        // Style status value with a colored pill style representation
        PdfPCell statusCell = new PdfPCell(new Paragraph(invoice.getStatus(), fontBold));
        statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        statusCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        statusCell.setPadding(5);
        statusCell.setBorderColor(new Color(229, 231, 235));
        metaDataTable.addCell(statusCell);

        addMetaValueCell(metaDataTable, invoice.getInvoiceDate().plusDays(15).format(formatter)); // 15 days net term

        document.add(metaDataTable);

        // Spacer
        document.add(new Paragraph(" "));

        // 4. Products Table
        PdfPTable itemsTable = new PdfPTable(5);
        itemsTable.setWidthPercentage(100);
        itemsTable.setWidths(new float[]{15, 45, 10, 15, 15});

        addTableHeaderCell(itemsTable, "SKU");
        addTableHeaderCell(itemsTable, "Product Name");
        addTableHeaderCell(itemsTable, "Qty");
        addTableHeaderCell(itemsTable, "Unit Price");
        addTableHeaderCell(itemsTable, "Total");

        int rowIndex = 0;
        for (InvoiceItem item : invoice.getItems()) {
            Color rowBg = (rowIndex % 2 == 0) ? Color.WHITE : new Color(249, 250, 251);

            addItemCell(itemsTable, item.getProduct().getSku(), rowBg, Element.ALIGN_LEFT);
            addItemCell(itemsTable, item.getProduct().getName(), rowBg, Element.ALIGN_LEFT);
            addItemCell(itemsTable, String.valueOf(item.getQuantity()), rowBg, Element.ALIGN_CENTER);
            addItemCell(itemsTable, "$" + item.getUnitPrice().setScale(2, BigDecimal.ROUND_HALF_UP), rowBg, Element.ALIGN_RIGHT);
            addItemCell(itemsTable, "$" + item.getLineTotal().setScale(2, BigDecimal.ROUND_HALF_UP), rowBg, Element.ALIGN_RIGHT);

            rowIndex++;
        }

        document.add(itemsTable);

        // Spacer
        document.add(new Paragraph(" "));

        // 5. Total Summaries Block
        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setWidthPercentage(100);
        summaryTable.setWidths(new float[]{60, 40});

        // Notes and Terms (Left)
        PdfPCell notesCell = new PdfPCell();
        notesCell.setBorder(Rectangle.NO_BORDER);
        notesCell.setPadding(10);
        Paragraph notesTitle = new Paragraph("Notes & Terms", fontBold);
        String notesText = (invoice.getNotes() != null && !invoice.getNotes().isBlank()) ? invoice.getNotes() : "Payment is due within 15 days of invoice date.";
        Paragraph notesPara = new Paragraph(notesText + "\n\nThank you for your business!", fontNormal);
        notesCell.addElement(notesTitle);
        notesCell.addElement(notesPara);
        summaryTable.addCell(notesCell);

        // Totals Calculations (Right)
        PdfPCell totalsCell = new PdfPCell();
        totalsCell.setBorder(Rectangle.NO_BORDER);
        totalsCell.setPadding(10);

        PdfPTable innerTotals = new PdfPTable(2);
        innerTotals.setWidthPercentage(100);
        innerTotals.setWidths(new float[]{60, 40});

        addTotalLabelCell(innerTotals, "Subtotal:");
        addTotalValCell(innerTotals, "$" + invoice.getSubtotal().setScale(2, BigDecimal.ROUND_HALF_UP));

        addTotalLabelCell(innerTotals, "Tax:");
        addTotalValCell(innerTotals, "$" + invoice.getTax().setScale(2, BigDecimal.ROUND_HALF_UP));

        addTotalLabelCell(innerTotals, "Discount:");
        addTotalValCell(innerTotals, "$" + invoice.getDiscount().setScale(2, BigDecimal.ROUND_HALF_UP));

        addGrandTotalLabelCell(innerTotals, "Grand Total:");
        addGrandTotalValCell(innerTotals, "$" + invoice.getGrandTotal().setScale(2, BigDecimal.ROUND_HALF_UP));

        totalsCell.addElement(innerTotals);
        summaryTable.addCell(totalsCell);

        document.add(summaryTable);

        // Footer block
        Paragraph footerLine = new Paragraph("_________________________________________________________________________________", fontSmall);
        footerLine.setAlignment(Element.ALIGN_CENTER);
        document.add(footerLine);

        Paragraph footerText = new Paragraph("LogiTrack Logistics System • Generated Automatically", fontSmall);
        footerText.setAlignment(Element.ALIGN_CENTER);
        document.add(footerText);

        document.close();
        return out.toByteArray();
    }

    private static void logoPCellFormatting(PdfPCell cell, Paragraph logo) {
        cell.addElement(logo);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    }

    private static void addMetaHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, fontBold));
        cell.setBackgroundColor(new Color(243, 244, 246));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        cell.setBorderColor(new Color(229, 231, 235));
        table.addCell(cell);
    }

    private static void addMetaValueCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, fontNormal));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        cell.setBorderColor(new Color(229, 231, 235));
        table.addCell(cell);
    }

    private static void addTableHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, fontHeader));
        cell.setBackgroundColor(new Color(79, 70, 229));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        cell.setBorderColor(new Color(79, 70, 229));
        table.addCell(cell);
    }

    private static void addItemCell(PdfPTable table, String text, Color bg, int alignment) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, fontNormal));
        cell.setBackgroundColor(bg);
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(8);
        cell.setBorderColor(new Color(243, 244, 246));
        table.addCell(cell);
    }

    private static void addTotalLabelCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, fontNormal));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(4);
        table.addCell(cell);
    }

    private static void addTotalValCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, fontNormal));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(4);
        table.addCell(cell);
    }

    private static void addGrandTotalLabelCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, fontBold));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(new Color(79, 70, 229));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private static void addGrandTotalValCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, fontBold));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(new Color(79, 70, 229));
        cell.setPadding(6);
        table.addCell(cell);
    }

    // Watermark Subclass
    private static class WatermarkPageEvent extends PdfPageEventHelper {
        private final String watermarkText;

        public WatermarkPageEvent(String watermarkText) {
            this.watermarkText = watermarkText;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            if (watermarkText == null || watermarkText.isEmpty()) {
                return;
            }
            PdfContentByte cb = writer.getDirectContentUnder();
            try {
                BaseFont bf = BaseFont.createFont(
                        BaseFont.HELVETICA_BOLD,
                        BaseFont.WINANSI,
                        BaseFont.EMBEDDED
                );
                cb.saveState();
                cb.beginText();
                cb.setColorFill(new Color(239, 68, 68, 40)); // Tailwind Red-500 equivalent with alpha
                cb.setFontAndSize(bf, 72);
                cb.showTextAligned(Element.ALIGN_CENTER, watermarkText, 297, 420, 45);
                cb.endText();
                cb.restoreState();
            } catch (Exception e) {
                log.error("Failed to draw PDF watermark", e);
            }
        }
    }
}
