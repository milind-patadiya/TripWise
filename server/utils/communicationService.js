const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { generateItineraryPDF } = require('./pdfGenerator');

// Initialize Twilio Client
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Initialize Nodemailer Transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendBookingConfirmation = async (userEmail, userPhone, bookingDetails) => {
  const {
    itemName,
    destinationName,
    checkIn,
    travelers,
    totalAmount,
    bookingRef,
  } = bookingDetails;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Booking Confirmed!</h2>
      <p>Thank you for booking with TripWise. Here are your booking details:</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e293b;">${itemName}</h3>
        <p style="color: #64748b; margin-bottom: 15px;">${destinationName}</p>
        
        <table style="width: 100%; text-align: left;">
          <tr>
            <th style="padding: 8px 0; color: #64748b;">Booking Ref:</th>
            <td style="font-weight: bold;">${bookingRef}</td>
          </tr>
          <tr>
            <th style="padding: 8px 0; color: #64748b;">Date:</th>
            <td>${new Date(checkIn).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
          </tr>
          <tr>
            <th style="padding: 8px 0; color: #64748b;">Travelers:</th>
            <td>${travelers}</td>
          </tr>
          <tr>
            <th style="padding: 8px 0; color: #64748b;">Total Paid:</th>
            <td style="color: #4f46e5; font-weight: bold; font-size: 18px;">₹${totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </table>
      </div>

      ${bookingDetails.itinerary && bookingDetails.itinerary.length > 0 ? `
      <div style="margin-top: 30px;">
        <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Your Day-by-Day Itinerary</h3>
        ${bookingDetails.itinerary.map(day => `
          <div style="margin-bottom: 25px;">
            <h4 style="color: #4f46e5; margin: 0 0 10px 0;">Day ${day.day}: ${day.theme}</h4>
            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; border-radius: 0 4px 4px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Morning:</strong> ${day.morning}</p>
              <p style="margin: 0 0 8px 0;"><strong>Afternoon:</strong> ${day.afternoon}</p>
              <p style="margin: 0;"><strong>Evening:</strong> ${day.evening}</p>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 40px;">
        TripWise 2026. This is a system-generated email.
      </p>
    </div>
  `;

  // Send Email
  if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
    try {
      // Generate the PDF Buffer
      const pdfBuffer = await generateItineraryPDF(bookingDetails, bookingDetails.travelerDetails?.firstName || 'Traveler');

      await transporter.sendMail({
        from: `"TripWise" <${process.env.GMAIL_EMAIL}>`,
        to: userEmail,
        subject: `TripWise Booking Confirmed - ${bookingRef}`,
        html: emailHtml,
        attachments: [
          {
            filename: `TripWise_Itinerary_${bookingRef}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });
      console.log('Confirmation email sent successfully with PDF attachment.');
    } catch (err) {
      console.error('Error sending confirmation email:', err);
    }
  } else {
    console.log('Skipping email send: GMAIL_EMAIL or GMAIL_APP_PASSWORD not set.');
  }

  // Send SMS
  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      // Format phone number to E.164 if missing country code (assuming +91 for India as default if exactly 10 digits)
      let formattedPhone = userPhone.trim();
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = '+91' + formattedPhone;
      }

      await twilioClient.messages.create({
        body: `TripWise: Your booking for ${itemName} is confirmed! Ref: ${bookingRef}. Date: ${new Date(checkIn).toLocaleDateString()}. Total: Rs. ${totalAmount.toLocaleString('en-IN')}. Have a great trip!`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      });
      console.log('Confirmation SMS sent successfully.');
    } catch (err) {
      console.error('Error sending confirmation SMS:', err);
    }
  } else {
    console.log('Skipping SMS send: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER not set.');
  }
};

module.exports = {
  sendBookingConfirmation,
};
