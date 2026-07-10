import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateItineraryPdf = (plannerData: any, itinerary: any) => {
  const doc = new jsPDF();
  const totalBudget = Object.values(itinerary.budgetBreakdown).reduce((a: any, b: any) => a + b, 0) as number;

  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  // ─── Custom Footer with Page Numbers ──────────────────────────
  const addFooter = (doc: jsPDF) => {
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text(`TripWise Enterprise Travel Planner | Generated on ${new Date().toLocaleString()}`, 14, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
    }
  };

  // ─── Header & Branding ──────────────────────────────────────
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('TripWise ✈️', 14, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`AI Itinerary for ${plannerData?.destination}`, 120, 25);

  // ─── Trip Summary ──────────────────────────────────────────
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Trip Summary', 14, 55);

  const travelerType = plannerData?.travelers === 1 ? 'Solo' : plannerData?.travelers === 2 ? 'Couple' : plannerData?.travelers <= 4 ? 'Family' : 'Group';

  autoTable(doc, {
    startY: 62,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2, textColor: [30, 41, 59] },
    body: [
      ['Source:', plannerData?.source || 'Origin City', 'Destination:', plannerData?.destination],
      ['Number of Days:', `${plannerData?.days} Days`, 'Travelers:', `${plannerData?.travelers} (${travelerType})`],
      ['Travel Style:', plannerData?.budget, 'Total Est. Cost:', `Rs. ${totalBudget.toLocaleString()}`],
    ],
  });

  // ─── Recommendations & Budget Allocation ───────────────────
  let finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendations & Budget Allocation', 14, finalY);
  
  autoTable(doc, {
    startY: finalY + 5,
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    head: [['Category', 'Recommendation', 'Estimated Budget']],
    body: [
      ['Transport', 'Check app for Flights & Trains', `Rs. ${itinerary.budgetBreakdown.transport.toLocaleString()}`],
      ['Accommodation', 'Check app for Top Rated Hotels', `Rs. ${itinerary.budgetBreakdown.hotel.toLocaleString()}`],
      ['Food & Dining', 'Local Street Food & Fine Dining', `Rs. ${itinerary.budgetBreakdown.food.toLocaleString()}`],
      ['Activities/Attractions', 'Guided Tours & Entry Fees', `Rs. ${itinerary.budgetBreakdown.activities.toLocaleString()}`],
    ],
  });

  // ─── Packing & Emergencies ──────────────────────────────────
  finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Packing List
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Packing Checklist', 14, finalY);
  const packingData = itinerary.packingList.map((item: string) => [`• ${item}`]);
  autoTable(doc, {
    startY: finalY + 5,
    margin: { left: 14, right: 110 },
    theme: 'plain',
    styles: { fontSize: 9 },
    body: packingData,
  });

  // Emergency Contacts
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Emergency Contacts (India)', 110, finalY);
  autoTable(doc, {
    startY: finalY + 5,
    margin: { left: 110 },
    theme: 'plain',
    styles: { fontSize: 9, textColor: [220, 38, 38] }, // Red text
    body: [
      ['National Emergency:', '112'],
      ['Police:', '100'],
      ['Ambulance:', '102'],
      ['Women Helpline:', '1091'],
    ],
  });

  // ─── Day-by-Day Itinerary ──────────────────────────────────
  doc.addPage();
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Day-wise AI Itinerary', 14, 25);

  let currentY = 35;

  itinerary.days.forEach((day: any) => {
    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [[`Day ${day.day} — ${day.theme}`]],
      body: [
        [`Morning: ${day.morning}`],
        [`Afternoon: ${day.afternoon}`],
        [`Evening: ${day.evening}`],
      ],
      styles: { cellPadding: 5, fontSize: 10, textColor: [51, 65, 85] },
      columnStyles: { 0: { cellWidth: 182 } },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;

    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }
  });

  // Add footer to all pages
  addFooter(doc);

  // Save PDF
  doc.save(`TripWise_${plannerData?.destination.replace(/\s+/g, '_')}_Itinerary.pdf`);
};
