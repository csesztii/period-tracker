import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import styles from "./Calendar.module.css";

const Calendar = forwardRef((props, ref) => {
  const [periods, setPeriods] = useState([]); // store all saved periods
  
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

  const isPeriodDay = (year, month, day) => {
    if (!day) return false;
    const target = new Date(year, month, day);

    return periods.some(period => {
      const start = new Date(period.start);
      const end = new Date(period.end);
      return target >= start && target <= end;
    });
  };

  //backend
  useEffect(() => {
    const loadPeriods = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/periods");
        const data = await res.json();

        // Convert each saved range into arrays of Date objects
        const parsed = data.map(p => ({
          id: p.id,
          start: new Date(p.start),
          end: new Date(p.end)
        }));
        
        setPeriods(parsed);
      } catch (err) {
        console.error("Failed to load periods:", err);
      }
    };

    loadPeriods();
  }, []);

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
              } ${isPeriodDay(currentYear, currentMonth, day) ? styles.periodDay : ""}`}
          >
            {day || ""} {/* for placeholder days */}
          </div>
        ))}
      </div>
    </div>
  );
});

export default Calendar;
