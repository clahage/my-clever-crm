import React from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const DashboardCalendar = ({ onChange, value }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="font-bold mb-2 text-lg">Calendar</h3>
      <Calendar onChange={onChange} value={value} />
    </div>
  );
};

export default DashboardCalendar;
