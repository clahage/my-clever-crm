import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ startDate, endDate, onChange }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="font-semibold">From:</span>
    <DatePicker
      selected={startDate}
      onChange={date => onChange([date, endDate])}
      selectsStart
      startDate={startDate}
      endDate={endDate}
      className="border rounded px-2 py-1"
    />
    <span className="font-semibold">To:</span>
    <DatePicker
      selected={endDate}
      onChange={date => onChange([startDate, date])}
      selectsEnd
      startDate={startDate}
      endDate={endDate}
      minDate={startDate}
      className="border rounded px-2 py-1"
    />
  </div>
);

export default DateRangePicker;
