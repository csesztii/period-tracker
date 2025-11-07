import React, { useState, forwardRef, useImperativeHandle } from "react";
import styles from "./Calendar.module.css";

const Calendar = forwardRef((props, ref) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // backward indexing

  const startDay = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const monthName = firstDayOfMonth.toLocaleString("default", { month: "long" });

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  useImperativeHandle(ref, () => ({
    goToToday() {
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
    },
  }));

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={goToPreviousMonth}>‹</button>
        <h2>{monthName} {currentYear}</h2>
        <button onClick={goToNextMonth}>›</button>
      </div>

      <div className={styles.weekdays}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className={styles.days}>
        {days.map((day, index) => (
          <div
            key={index}
            className={`${styles.day} ${day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear()
              ? styles.today
              : ""
              }`}
          >
            {day || ""} {/* for placeholder days */}
          </div>
        ))}
      </div>
    </div>
  );
});

export default Calendar;
