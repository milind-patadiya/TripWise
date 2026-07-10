require('dotenv').config();
const { sendBookingConfirmation } = require('./utils/communicationService');

async function testEmail() {
  console.log('Using Gmail:', process.env.GMAIL_EMAIL);
  
  const mockBooking = {
    itemName: 'Test Booking',
    destinationName: 'Test Destination',
    checkIn: new Date(),
    travelers: 2,
    totalAmount: 15000,
    bookingRef: 'TEST12345',
    travelerDetails: {
      firstName: 'Test',
      lastName: 'User'
    },
    itinerary: [
      {
        day: 1,
        theme: 'Test Day',
        morning: 'Test morning',
        afternoon: 'Test afternoon',
        evening: 'Test evening'
      }
    ]
  };

  // Send the test email to tripwise96@gmail.com (sending to itself)
  await sendBookingConfirmation(process.env.GMAIL_EMAIL, '1234567890', mockBooking);
  console.log('Test complete. Check the inbox for tripwise96@gmail.com.');
}

testEmail();
