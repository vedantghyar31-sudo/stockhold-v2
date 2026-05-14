import { Bill, ShopProfile } from '@/types';
import { formatINR } from './utils';
import { format } from 'date-fns';

export const generatePDF = async (bill: Bill, profile?: Partial<ShopProfile> | null): Promise<void> => {
  const jsPDF     = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;

  const doc   = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const L = 20, R = pageW - 20;

  const shop    = profile?.shopName    || bill.shopName    || 'Stockhold';
  const addr    = profile?.shopAddress || bill.shopAddress || '';
  const phone   = profile?.shopPhone   || bill.shopPhone   || '';
  const date    = bill.createdAt?.toDate
    ? format(bill.createdAt.toDate(), 'dd MMMM, yyyy')
    : format(new Date(), 'dd MMMM, yyyy');

  // ── White canvas ────────────────────────────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, 'F');

  // ── Logo area (top-left) ────────────────────────────────────────────
  if (profile?.shopLogo) {
    try {
      doc.addImage(profile.shopLogo, 'WEBP', L, 12, 22, 22);
    } catch { /* logo load failed, skip */ }
  }
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);
  if (!profile?.shopLogo) { doc.text('YOUR', L, 14); doc.text('LOGO', L, 19); }

  // ── Invoice number top-right ────────────────────────────────────────
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`NO. ${bill.invoiceId}`, R, 15, { align: 'right' });

  // ── Big INVOICE heading ─────────────────────────────────────────────
  doc.setFontSize(44);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 15, 15);
  doc.text('INVOICE', L, 48);

  // ── Date ────────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 15, 15);
  doc.text('Date:', L, 60);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(date, L + 16, 60);

  // ── Divider ─────────────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(L, 66, R, 66);

  // ── Billed To | From ────────────────────────────────────────────────
  const col2 = pageW / 2 + 5;
  let y = 74;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 15, 15);
  doc.text('Billed to:', L, y);
  doc.text('From:', col2, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);

  doc.text(bill.customerName || 'Walk-in Customer', L, y);
  doc.text(shop, col2, y);
  y += 6;

  if (bill.customerMobile) { doc.text(bill.customerMobile, L, y); }
  if (addr) doc.text(addr, col2, y);
  y += 6;
  if (phone) doc.text(phone, col2, y);

  // ── Items table ──────────────────────────────────────────────────────
  const tableY = Math.max(y + 12, 108);
  autoTable(doc, {
    startY: tableY,
    head:   [['Item', 'Quantity', 'Price', 'Amount']],
    body:   bill.items.map((i) => [
      i.productName,
      i.quantity.toString(),
      formatINR(i.unitPrice),
      formatINR(i.total),
    ]),
    styles: {
      fontSize:    9.5,
      cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
      textColor:   [40, 40, 40],
      lineColor:   [210, 210, 210],
      lineWidth:   0.2,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [40, 40, 40],
      fontStyle: 'normal',
      fontSize:  9.5,
      lineWidth: 0,
    },
    bodyStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 28 },
      2: { halign: 'right',  cellWidth: 36 },
      3: { halign: 'right',  cellWidth: 36 },
    },
    margin: { left: L, right: 20 },
    tableLineColor: [210, 210, 210],
    tableLineWidth: 0.2,
  });

  // ── Total row ────────────────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(L, finalY + 2, R, finalY + 2);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 15, 15);
  doc.text('Total', R - 42, finalY + 10);
  doc.text(formatINR(bill.totalAmount), R, finalY + 10, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.setDrawColor(15, 15, 15);
  doc.line(L, finalY + 13, R, finalY + 13);

  // ── Payment summary ──────────────────────────────────────────────────
  let py = finalY + 22;

  const summaryRow = (label: string, value: string, color: [number, number, number] = [60, 60, 60]) => {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 15, 15);
    doc.text(label, L, py);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...color);
    doc.text(value, L + 38, py);
    py += 7;
  };

  summaryRow('Payment method:', bill.paymentType === 'cash' ? 'Cash' : 'Online');
  summaryRow('Paid Amount:',    formatINR(bill.paidAmount),  [22, 163, 74]);
  if (bill.remainingAmount > 0) {
    summaryRow('Balance Due:',  formatINR(bill.remainingAmount), [200, 40, 40]);
  }

  // Status indicator
  const statusMap: Record<string, { label: string; color: [number,number,number] }> = {
    successful: { label: '● PAID',      color: [22, 163, 74]  },
    pending:    { label: '● PENDING',   color: [180, 130, 0]  },
    half_paid:  { label: '● HALF PAID', color: [200, 90, 0]   },
    returned:   { label: '● RETURNED',  color: [200, 40, 40]  },
  };
  const st = statusMap[bill.paymentStatus] || { label: '● UNKNOWN', color: [100,100,100] as [number,number,number] };
  py += 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...st.color);
  doc.text(st.label, L, py);
  py += 10;

  // ── Note & thank you ─────────────────────────────────────────────────
  if (bill.notes) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 15, 15);
    doc.text('Note:', L, py);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(bill.notes, L + 14, py);
    py += 8;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Thank you for choosing us!', L, py);

  // ── Decorative blobs (bottom) ────────────────────────────────────────
  doc.setFillColor(200, 200, 200);
  doc.circle(22, pageH + 4, 36, 'F');
  doc.setFillColor(45, 45, 45);
  doc.circle(pageW - 8, pageH + 8, 44, 'F');

  // ── Footer ───────────────────────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);
  doc.text('stockhold1.netlify.app', pageW / 2, pageH - 6, { align: 'center' });

  doc.save(`${bill.invoiceId}.pdf`);
};
