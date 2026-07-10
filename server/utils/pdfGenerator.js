const PDFDocument = require('pdfkit');

const generateItineraryPDF = (bookingDetails, userName) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- Header ---
      // Background for header
      doc.rect(0, 0, doc.page.width, 100).fill('#4f46e5');
      
      // TripWise Branding
      doc.fillColor('#ffffff')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('TripWise', 50, 40);

      doc.fontSize(12)
         .font('Helvetica')
         .text('Your Trusted Travel Partner', 50, 75);

      // --- Title Section ---
      doc.moveDown(4);
      doc.fillColor('#1e293b')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('Booking Confirmed', { align: 'center' });

      doc.moveDown(1);
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#64748b')
         .text(`Hi ${userName}, here is the complete itinerary for your upcoming trip!`, { align: 'center' });

      doc.moveDown(2);

      // --- Booking Summary Box ---
      const summaryStartY = doc.y;
      doc.rect(50, summaryStartY, doc.page.width - 100, 160)
         .fillAndStroke('#f8fafc', '#e2e8f0');

      doc.fillColor('#1e293b')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(bookingDetails.itemName, 70, summaryStartY + 20);

      doc.fillColor('#64748b')
         .fontSize(12)
         .font('Helvetica')
         .text(bookingDetails.destinationName, 70, summaryStartY + 45);

      const leftColX = 70;
      const rightColX = doc.page.width / 2 + 20;
      let currentY = summaryStartY + 75;

      // Row 1
      doc.font('Helvetica-Bold').fillColor('#64748b').text('Booking Ref:', leftColX, currentY);
      doc.font('Helvetica').fillColor('#1e293b').text(bookingDetails.bookingRef, leftColX + 90, currentY);

      doc.font('Helvetica-Bold').fillColor('#64748b').text('Travelers:', rightColX, currentY);
      doc.font('Helvetica').fillColor('#1e293b').text(String(bookingDetails.travelers), rightColX + 80, currentY);

      currentY += 25;
      
      // Row 2
      const checkInDate = new Date(bookingDetails.checkIn).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      doc.font('Helvetica-Bold').fillColor('#64748b').text('Date:', leftColX, currentY);
      doc.font('Helvetica').fillColor('#1e293b').text(checkInDate, leftColX + 90, currentY);

      doc.font('Helvetica-Bold').fillColor('#64748b').text('Payment:', rightColX, currentY);
      doc.font('Helvetica-Bold').fillColor('#10b981').text('PAID', rightColX + 80, currentY);

      currentY += 25;

      // Row 3
      doc.font('Helvetica-Bold').fillColor('#64748b').text('Total Amount:', leftColX, currentY);
      doc.font('Helvetica-Bold').fillColor('#4f46e5').fontSize(14).text(`Rs. ${bookingDetails.totalAmount.toLocaleString('en-IN')}`, leftColX + 90, currentY - 2);

      doc.y = summaryStartY + 180; // Move cursor below the box

      // --- Day-by-Day Itinerary ---
      if (bookingDetails.itinerary && bookingDetails.itinerary.length > 0) {
        doc.moveDown(2);
        doc.fillColor('#1e293b')
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Day-by-Day Itinerary');
        
        doc.moveTo(50, doc.y + 5).lineTo(doc.page.width - 50, doc.y + 5).stroke('#e2e8f0');
        doc.moveDown(1.5);

        bookingDetails.itinerary.forEach((day) => {
          // Check for page break
          if (doc.y > doc.page.height - 150) {
            doc.addPage();
          }

          doc.fillColor('#4f46e5')
             .fontSize(14)
             .font('Helvetica-Bold')
             .text(`Day ${day.day}: ${day.theme}`);
          
          doc.moveDown(0.5);

          const indent = 65;
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('Morning:', 50, doc.y);
          doc.font('Helvetica').fillColor('#475569').text(day.morning, indent + 10, doc.y - 12, { width: doc.page.width - 130 });
          doc.moveDown(0.5);

          doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('Afternoon:', 50, doc.y);
          doc.font('Helvetica').fillColor('#475569').text(day.afternoon, indent + 18, doc.y - 12, { width: doc.page.width - 140 });
          doc.moveDown(0.5);

          doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('Evening:', 50, doc.y);
          doc.font('Helvetica').fillColor('#475569').text(day.evening, indent + 10, doc.y - 12, { width: doc.page.width - 130 });
          
          doc.moveDown(1.5);
        });
      }

      // --- Important Notes / Footer ---
      doc.moveDown(2);
      doc.rect(50, doc.y, doc.page.width - 100, 90).fill('#fffbeb');
      
      doc.fillColor('#d97706').fontSize(12).font('Helvetica-Bold').text('Important Travel Notes:', 70, doc.y + 15);
      doc.fillColor('#92400e').fontSize(10).font('Helvetica').text('• Please carry a valid government-issued ID.\n• Arrive at the airport or hotel at least 2 hours prior to scheduled times.\n• For any emergencies or changes, contact support@tripwise.com or call +91-1800-TRIPWISE.', 70, doc.y + 5);

      // Page Numbers
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(9)
           .fillColor('#94a3b8')
           .text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 40, { align: 'center' });
      }

      // Finalize PDF file
      doc.end();

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateItineraryPDF,
};
