import { motion, AnimatePresence } from "framer-motion";
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
  const currentMonthRef = useRef(null);
  const visibleMonthsRef = useRef(visibleMonths);

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

  // Current month listener
  useEffect(() => {
    visibleMonthsRef.current = visibleMonths;
  }, [visibleMonths]);

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      
      if (!container) return;

      const visible = visibleMonthsRef.current;
      
      // Scroll up → load previous
      if (container.scrollTop < 50) {
        const first = visible[0];
        const newMonth = new Date(first.getFullYear(), first.getMonth() - 1, 1);
        setVisibleMonths((prev) => [newMonth, ...prev]);
        container.scrollTop = container.scrollHeight / 3;
      }

      // Scroll down → load next
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
        const last = visible[visible.length - 1];
        const newMonth = new Date(last.getFullYear(), last.getMonth() + 1, 1);
        setVisibleMonths((prev) => [...prev, newMonth]);
      }
    };
    console.log(visibleMonths[0]) // TODO: delete

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToToday = () => {
    currentMonthRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 70, damping: 15 }}
      >
        <div className={styles.header}>
          <h2>Add Cycle Mode</h2>

          <div className={styles.headerButtons}>
            <motion.button
              className={styles.todayButton}
              onClick={scrollToToday}
              whileTap={{ scale: 0.9 }}
            >
              Today
            </motion.button>
            <button className={styles.closeBtn} onClick={props?.onClose}>✕</button>
          </div>
        </div>

        <div ref={containerRef} className={styles.scrollContainer}>
          {visibleMonths.map((monthDate, idx) => {
            const { year, month, monthName, days } = getMonthData(
              monthDate.getFullYear(),
              monthDate.getMonth()
            );

            const isCurrentMonth =
              monthDate.getFullYear() === today.getFullYear() &&
              monthDate.getMonth() === today.getMonth();

            return (
              <motion.div
                key={idx}
                ref={isCurrentMonth ? currentMonthRef : null}
                className={`${styles.month} ${
                  isCurrentMonth ? styles.currentMonth : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >

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
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
