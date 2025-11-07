import React, { useState, useRef, useEffect } from "react";
import styles from "./InfiniteCalendar.module.css";

export default function InfiniteCalendar(props) {
  const today = new Date();
  const [visibleMonths, setVisibleMonths] = useState(() => {
    const current = new Date(today.getFullYear(), today.getMonth(), 1);
    const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return [prev, current, next];
  });

  const containerRef = useRef(null);

  // Create month data
  const getMonthData = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    const monthName = firstDay.toLocaleString("default", { month: "long" });
    return { year, month, monthName, days };
  };

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      // Scroll up → load previous
      if (container.scrollTop < 50) {
        const first = visibleMonths[0];
        const newMonth = new Date(first.getFullYear(), first.getMonth() - 1, 1);
        setVisibleMonths((prev) => [newMonth, ...prev]);
        container.scrollTop = container.scrollHeight / 3;
      }

      // Scroll down → load next
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
        const last = visibleMonths[visibleMonths.length - 1];
        const newMonth = new Date(last.getFullYear(), last.getMonth() + 1, 1);
        setVisibleMonths((prev) => [...prev, newMonth]);
      }

      console.log("scrollTop:", container.scrollTop, "height:", container.scrollHeight);
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [visibleMonths]);

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <h2>Add Cycle Mode</h2>
        <button className={styles.closeBtn} onClick={props?.onClose}>✕</button>
      </div>

      <div ref={containerRef} className={styles.scrollContainer}>
        {visibleMonths.map((monthDate, idx) => {
          const { year, month, monthName, days } = getMonthData(
            monthDate.getFullYear(),
            monthDate.getMonth()
          );

          return (
            <div key={idx} className={styles.month}>
              <div className={styles.monthHeader}>
                {monthName} {year}
              </div>
              <div className={styles.weekdays}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className={styles.days}>
                {days.map((day, index) => (
                  <div key={index} className={styles.day}>
                    {day || ""}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
