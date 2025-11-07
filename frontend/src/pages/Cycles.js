import React, { useState, useRef } from "react";
import Calendar from "../components/Calendar";
import InfiniteCalendar from "../components/InfiniteCalendar";

export default function Cycles() {
  const [showInfinite, setShowInfinite] = useState(false);
  const calendarRef = useRef();

  const handleTodayClick = () => {
    calendarRef.current?.goToToday();
  };

  return (
    <div>
      <h1>My Cycle Calendar</h1>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button onClick={() => setShowInfinite(true)}>Add Cycle</button>
        <button onClick={handleTodayClick}>Today</button>
      </div>

      <Calendar ref={calendarRef} />

      {showInfinite && <InfiniteCalendar onClose={() => setShowInfinite(false)} />}
    </div>
  );
}