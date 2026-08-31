import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { toast } from "react-toastify";

export const handleDownloadPDF = (poData) => {
  if (!poData) return;
  
  try {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    const tableWidth = pageWidth - (2 * margin);

    // Title
    doc.setFontSize(16);
    doc.text(`Purchase Order Details - ${poData.po_number}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Function to add table with header and data
    const addTable = (title, headers, data, columnWidths) => {
      // Check if we need new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      // Add title
      doc.setFontSize(12);
      doc.text(title, margin, yPosition);
      yPosition += 8;

      // Table header
      doc.setFillColor(200, 200, 200);
      doc.rect(margin, yPosition, tableWidth, 8, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      let xPosition = margin + 2;
      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition + 6);
        xPosition += columnWidths[index];
      });
      yPosition += 8;

      // Table rows
      doc.setFontSize(10);
      data.forEach((row, rowIndex) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
          // Add header again on new page
          doc.setFillColor(200, 200, 200);
          doc.rect(margin, yPosition, tableWidth, 8, 'F');
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          xPosition = margin + 2;
          headers.forEach((header, index) => {
            doc.text(header, xPosition, yPosition + 6);
            xPosition += columnWidths[index];
          });
          yPosition += 8;
          doc.setFontSize(7);
        }

        // Alternate row colors
        if (rowIndex % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPosition, tableWidth, 8, 'F');
        }

        xPosition = margin + 2;
        row.forEach((cell, cellIndex) => {
          doc.text(cell.toString(), xPosition, yPosition + 6);
          xPosition += columnWidths[cellIndex];
        });
        yPosition += 8;
      });
      yPosition += 10;
    };

    // Basic Information - As Simple Text (NOT in table)
    doc.setFontSize(12);
    doc.text("Basic Information", margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.text(`PO Number: ${poData.po_number}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Vendor: ${poData.purchaseOrder?.vendor_name || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Invoice Amount: ${poData.total_invoice_amount || '0'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Profit Margin: ${poData.profit_calculation?.profit_margin || '0%'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Received: ${poData.total_received || '0'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Remaining Amount: ${poData.remaining_amount || '0'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Base Amount with GST: ${poData.base_amount_with_gst || '0'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Expenses: ${poData.total_expenses || '0'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Taxable Expenses: ${poData.total_taxable_expenses || '0'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Non-Taxable Expenses: ${poData.total_non_taxable_expenses || '0'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Salaries: ${poData.total_salaries || '0'}`, margin, yPosition);
    yPosition += 15;

    // Profit Calculation - As Simple Text (NOT in table)
    if (poData.profit_calculation) {
      doc.setFontSize(12);
      doc.text("Profit Calculation", margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.text(`Total Income: ${poData.profit_calculation.total_income || '0'}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Total Costs: ${poData.profit_calculation.total_costs || '0'}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Net Profit: ${poData.profit_calculation.net_profit || '0'}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Profit Margin: ${poData.profit_calculation.profit_margin || '0%'}`, margin, yPosition);
      yPosition += 15;
    }

    // Items Table
    if (poData.purchaseOrder?.items && poData.purchaseOrder.items.length > 0) {
      const itemsData = poData.purchaseOrder.items.map(item => [
        item.item_name || 'N/A',
        item.quantity || '0',
        item.unit_price || '0',
        item.unit || 'N/A'
      ]);
      addTable(`Items (${poData.purchaseOrder.items.length})`, 
        ["Item Name", "Quantity", "Unit Price", "Unit"], 
        itemsData, 
        [70, 30, 40, 40]
      );
    }

    // Invoices Table
    if (poData.invoices && poData.invoices.length > 0) {
      const invoicesData = poData.invoices.map(invoice => [
        invoice.id.toString(),
        invoice.payment_amount || '0',
        invoice.gst_amount || '0',
        invoice.total_amount || '0',
        invoice.remaining_amount || '0',
        invoice.gst_type || 'N/A',
        invoice.status || 'N/A'
      ]);
      addTable(`Invoices (${poData.invoices.length})`, 
        ["ID", "Payment Amt", "GST Amt", "Total Amt", "Remaining", "GST Type", "Status"], 
        invoicesData, 
        [15, 25, 25, 25, 25, 30, 25]
      );
    }

    // Taxable Expenses Table - ALL DATA
    if (poData.taxable_expenses && poData.taxable_expenses.length > 0) {
      const taxableData = poData.taxable_expenses.map(expense => [
        expense.id.toString(),
        expense.payment_date || 'N/A',
        expense.description ? (expense.description.length > 40 ? expense.description.substring(0, 40) + '...' : expense.description) : 'No description',
        expense.subtotal || '0',
        expense.tax_total || '0',
        expense.total_amount || '0',
        expense.payments_status || 'N/A'
      ]);
      addTable(`Taxable Expenses (${poData.taxable_expenses.length}) - Total: ${poData.total_taxable_expenses || '0'}`, 
        ["ID", "Date", "Description", "Subtotal", "Tax", "Total", "Status"], 
        taxableData, 
        [15, 25, 60, 25, 20, 25, 20]
      );
    }

    // Non-Taxable Expenses Table - ALL DATA
    if (poData.non_taxable_expenses && poData.non_taxable_expenses.length > 0) {
      const nonTaxableData = poData.non_taxable_expenses.map(expense => [
        expense.id.toString(),
        expense.payment_date || 'N/A',
        expense.description ? (expense.description.length > 40 ? expense.description.substring(0, 40) + '...' : expense.description) : 'No description',
        expense.subtotal || '0',
        expense.tax_total || '0',
        expense.total_amount || '0',
        expense.payments_status || 'N/A'
      ]);
      addTable(`Non-Taxable Expenses (${poData.non_taxable_expenses.length}) - Total: ${poData.total_non_taxable_expenses || '0'}`, 
        ["ID", "Date", "Description", "Subtotal", "Tax", "Total", "Status"], 
        nonTaxableData, 
        [15, 25, 60, 25, 20, 25, 20]
      );
    }

    // Employee Payslips Table - ALL DATA
    if (poData.payslips && poData.payslips.length > 0) {
      const payslipsData = poData.payslips.map(payslip => [
        payslip.employee_id.toString(),
        payslip.employee_name || 'N/A',
        payslip.department || 'N/A',
        payslip.designation || 'N/A',
        payslip.basic_salary.toString(),
        payslip.net_payble || '0',
        // payslip.status || 'N/A'
      ]);
      addTable(`Employee Payslips (${poData.payslips.length}) - Total Salary: ${poData.total_salaries || '0'}`, 
        ["Emp ID", "Name", "Department", "Designation", "Basic Salary", "Net Pay"], 
        payslipsData, 
        [20, 40, 35, 35, 25, 25, 20]
      );
    }

    doc.save(`${poData.po_number}_complete_details.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Error generating PDF file");
  }
};

export const handleDownloadExcel = (poData) => {
  if (!poData) return;
  try {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [];

    // Main title
    worksheetData.push([`Purchase Order Details - ${poData.po_number}`]);
    worksheetData.push([]);

    // BASIC INFORMATION
    worksheetData.push(["BASIC INFORMATION"]);
    worksheetData.push([
      "PO Number", poData.po_number,
      "Vendor", poData.purchaseOrder?.vendor_name || 'N/A'
    ]);
    worksheetData.push([
      "Total Invoice Amount", poData.total_invoice_amount || '0',
      "Profit Margin", poData.profit_calculation?.profit_margin || '0%'
    ]);
    worksheetData.push([
      "Total Received", poData.total_received || '0',
      "Remaining Amount", poData.remaining_amount || '0'
    ]);
    worksheetData.push([
      "Base Amount with GST", poData.base_amount_with_gst || '0',
      "Total Expenses", poData.total_expenses || '0'
    ]);
    worksheetData.push([
      "Total Taxable Expenses", poData.total_taxable_expenses || '0',
      "Total Non-Taxable Expenses", poData.total_non_taxable_expenses || '0'
    ]);
    worksheetData.push([
      "Total Salaries", poData.total_salaries || '0',
      "", ""
    ]);

    // PROFIT CALCULATION
    if (poData.profit_calculation) {
      worksheetData.push([]);
      worksheetData.push(["PROFIT CALCULATION"]);
      worksheetData.push(["Total Income", "Total Costs", "Net Profit", "Profit Margin"]);
      worksheetData.push([
        poData.profit_calculation.total_income || '0',
        poData.profit_calculation.total_costs || '0',
        poData.profit_calculation.net_profit || '0',
        poData.profit_calculation.profit_margin || '0%'
      ]);
    }

    // ITEMS
    if (poData.purchaseOrder?.items && poData.purchaseOrder.items.length > 0) {
      worksheetData.push([]);
      worksheetData.push(["ITEMS"]);
      worksheetData.push(["Item Name", "Quantity", "Unit Price", "Unit"]);
      poData.purchaseOrder.items.forEach(item => {
        worksheetData.push([
          item.item_name || 'N/A',
          item.quantity || '0',
          item.unit_price || '0',
          item.unit || 'N/A'
        ]);
      });
    }

    // INVOICES
    if (poData.invoices && poData.invoices.length > 0) {
      worksheetData.push([]);
      worksheetData.push(["INVOICES"]);
      worksheetData.push([
        "Number", "Payment Amount", "GST Amount",
        "Total Amount", "Remaining Amount", "GST Type", "Status"
      ]);

      let totalPayment = 0, totalGST = 0, totalAmount = 0, totalRemaining = 0;

      poData.invoices.forEach(inv => {
        const pay = parseFloat(inv.payment_amount || 0);
        const gst = parseFloat(inv.gst_amount || 0);
        const total = parseFloat(inv.total_amount || 0);
        const remain = parseFloat(inv.remaining_amount || 0);

        totalPayment += pay;
        totalGST += gst;
        totalAmount += total;
        totalRemaining += remain;

        worksheetData.push([
          inv.id?.toString() || '',
          pay.toFixed(2),
          gst.toFixed(2),
          total.toFixed(2),
          remain.toFixed(2),
          inv.gst_type || 'N/A',
          inv.status || 'N/A'
        ]);
      });

      worksheetData.push([
        "Grand Totals",
        totalPayment.toFixed(2),
        totalGST.toFixed(2),
        totalAmount.toFixed(2),
        totalRemaining.toFixed(2),
        "", ""
      ]);
    }

    // TAXABLE EXPENSES
    if (poData.taxable_expenses && poData.taxable_expenses.length > 0) {
      worksheetData.push([]);
      worksheetData.push([`TAXABLE EXPENSES - Total: ${poData.total_taxable_expenses || '0'}`]);
      worksheetData.push(["Date", "Description", "Subtotal", "Tax", "Total", "Status"]);

      let totalSub = 0, totalTax = 0, totalAmt = 0;

      poData.taxable_expenses.forEach(exp => {
        const sub = parseFloat(exp.subtotal || 0);
        const tax = parseFloat(exp.tax_total || 0);
        const tot = parseFloat(exp.total_amount || 0);

        totalSub += sub;
        totalTax += tax;
        totalAmt += tot;

        worksheetData.push([
          exp.payment_date || 'N/A',
          exp.description || 'No description',
          sub.toFixed(2),
          tax.toFixed(2),
          tot.toFixed(2),
          exp.payments_status || 'N/A'
        ]);
      });

      worksheetData.push([
        "Grand Totals",
        "",
        totalSub.toFixed(2),
        totalTax.toFixed(2),
        totalAmt.toFixed(2),
        ""
      ]);
    }

    // NON-TAXABLE EXPENSES
    if (poData.non_taxable_expenses && poData.non_taxable_expenses.length > 0) {
      worksheetData.push([]);
      worksheetData.push([`NON-TAXABLE EXPENSES - Total: ${poData.total_non_taxable_expenses || '0'}`]);
      worksheetData.push(["Date", "Description", "Subtotal", "Tax", "Total", "Status"]);

      let totalSub = 0, totalTax = 0, totalAmt = 0;

      poData.non_taxable_expenses.forEach(exp => {
        const sub = parseFloat(exp.subtotal || 0);
        const tax = parseFloat(exp.tax_total || 0);
        const tot = parseFloat(exp.total_amount || 0);

        totalSub += sub;
        totalTax += tax;
        totalAmt += tot;

        worksheetData.push([
          exp.payment_date || 'N/A',
          exp.description || 'No description',
          sub.toFixed(2),
          tax.toFixed(2),
          tot.toFixed(2),
          exp.payments_status || 'N/A'
        ]);
      });

      worksheetData.push([
        "Grand Totals",
        "",
        totalSub.toFixed(2),
        totalTax.toFixed(2),
        totalAmt.toFixed(2),
        ""
      ]);
    }

    // EMPLOYEE PAYSLIPS
    if (poData.payslips && poData.payslips.length > 0) {
      worksheetData.push([]);
      worksheetData.push([`EMPLOYEE PAYSLIPS - Total Salary: ${poData.total_salaries || '0'}`]);
      worksheetData.push(["Employee ID", "Name", "Department", "Designation", "Basic Salary", "Net Payable", "Status"]);

      let totalBasic = 0, totalNet = 0;

      poData.payslips.forEach(p => {
        const basic = parseFloat(p.basic_salary || 0);
        const net = parseFloat(p.net_payble || 0);
        totalBasic += basic;
        totalNet += net;

        worksheetData.push([
          p.employee_id?.toString() || '',
          p.employee_name || 'N/A',
          p.department || 'N/A',
          p.designation || 'N/A',
          basic.toFixed(2),
          net.toFixed(2),
          p.status || 'N/A'
        ]);
      });

      worksheetData.push([
        "Grand Totals",
        "", "", "",
        totalBasic.toFixed(2),
        totalNet.toFixed(2),
        ""
      ]);
    }

    // ---- Create worksheet ----
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Merge & center-align titles
    worksheet['!merges'] = worksheet['!merges'] || [];

    worksheetData.forEach((row, rowIndex) => {
      if (typeof row[0] === 'string' && (
        row[0].startsWith("TAXABLE EXPENSES") ||
        row[0].startsWith("NON-TAXABLE EXPENSES") ||
        row[0].startsWith("EMPLOYEE PAYSLIPS")
      )) {
        const nextRow = worksheetData[rowIndex + 1];
        const numCols = nextRow ? nextRow.length : 6;

        worksheet['!merges'].push({
          s: { r: rowIndex, c: 0 },
          e: { r: rowIndex, c: numCols - 1 }
        });

        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: "center" },
            fill: { fgColor: { rgb: "D3D3D3" } }
          };
        }
      }
    });

    // Merge main title
    worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });

    // Column widths
    worksheet['!cols'] = Array(8).fill({ width: 20 });

    // ---- Export ----
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Order Summary");
    XLSX.writeFile(workbook, `${poData.po_number}_complete_summary.xlsx`);

  } catch (error) {
    console.error("Error generating Excel:", error);
    toast.error("Error generating Excel file");
  }
};

