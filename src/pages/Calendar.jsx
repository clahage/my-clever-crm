import React from 'react';
// ...existing code from backup...
import React from "react";
import CalendarComponent from "../components/Calendar";

export default function CalendarPage() {
  console.log("CalendarPage loading CalendarComponent");
  try {
    return <CalendarComponent />;
  } catch (error) {
    console.error("Calendar component error:", error);
    return (
      <div className="p-4">
        <h2>Calendar Error</h2>
        <p>Error loading calendar: {error.message}</p>
      </div>
    );
  }
}
