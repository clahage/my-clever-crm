// scr-admin-vite/src/components/ConsultantBooking.jsx
import React from 'react';
import Card from './ui/card'; // Relative path
import Button from './ui/button'; // Relative path

function ConsultantBooking() {
  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <h3 className="text-xl font-semibold mb-4 text-center">Consultant Booking System</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
        Allow clients to book appointments directly with your credit repair consultants.
      </p>
      <div className="flex flex-col items-center mb-4">
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">Status: Active</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Appointments: 3</p>
      </div>
      <Button>View Booking Calendar</Button>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
        (Future integration with calendar APIs like Google Calendar or dedicated booking platforms.)
      </p>
    </Card>
  );
}

export default ConsultantBooking;