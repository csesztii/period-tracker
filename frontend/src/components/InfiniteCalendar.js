import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import styles from "./InfiniteCalendar.module.css";

export default function InfiniteCalendar(props) {
  // add period
  const [isAddPeriodMode, setIsAddPeriodMode] = useState(false);
  const [selectedRange, setSelectedRange] = useState([]); // store clicked days
  const [periods, setPeriods] = useState([]); // store all saved periods

  // scrolling
  const y = useMotionValue(0);

  // month display
  const today = new Date();
  const [visibleMonths, setVisibleMonths] = useState(() => {
    const current = new Date(today.getFullYear(), today.getMonth(), 1);
    const beforePrev = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const afterNext = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    return [beforePrev, prev, current, next, afterNext];
  });

  const containerRef = useRef(null);
  const headerRef = useRef(null);
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

  const setUpVisibleMonths = (middleMonth) => {
    const beforePrev = new Date(middleMonth.getFullYear(), middleMonth.getMonth() - 2, 1);
    const prev = new Date(middleMonth.getFullYear(), middleMonth.getMonth() - 1, 1);
    const next = new Date(middleMonth.getFullYear(), middleMonth.getMonth() + 1, 1);
    const afterNext = new Date(middleMonth.getFullYear(), middleMonth.getMonth() + 2, 1);

    setVisibleMonths([beforePrev, prev, middleMonth, next, afterNext]);
  }

  // backend
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

  const savePeriodToBackend = async (range) => {
    try {
      const response = await fetch("http://localhost:5000/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: range.start.toISOString(),
          end: range.end.toISOString(),
        }),
      });

      const data = await response.json();
      console.log("Saved period:", data);
    } catch (err) {
      console.error("Failed to save period:", err);
    }
  };


  // Current month listener
  useEffect(() => {
    visibleMonthsRef.current = visibleMonths;
  }, [visibleMonths]);

  // Infinite scroll listener
  useEffect(() => {
    let isScrolling = false;

    const handleScroll = () => {
      if (isScrolling) return;
      isScrolling = true;

      setTimeout(() => {
        isScrolling = false;
        const container = containerRef.current;
        
        if (!container) return;

        const middle = visibleMonthsRef.current[2];
        const threshold = 20;
        const prevScrollTop = container.scrollTop;
        const prevScrollHeight = container.scrollHeight;
        
        // Scroll up → load previous
        if (container.scrollTop < threshold) {
          // Compute new months
          const newCurrent = new Date(middle.getFullYear(), middle.getMonth() - 2, 1);
          setUpVisibleMonths(newCurrent);

          requestAnimationFrame(() => { // or queueMicrotask
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = 
              prevScrollTop + (newScrollHeight - prevScrollHeight) * 0.4;
          });
        }

        // Scroll down → load next
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - threshold) {
          // Compute new months
          const newCurrent = new Date(middle.getFullYear(), middle.getMonth() + 2, 1);
          setUpVisibleMonths(newCurrent);

          queueMicrotask(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop =
              prevScrollTop - (newScrollHeight - prevScrollHeight) * 0.4;
          });
        }
      }, 200);
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll current month to the middle of the view on mount
  useEffect(() => {
    const container = containerRef.current;
    const current = currentMonthRef.current;
    if (!container || !current) return;

    requestAnimationFrame(() => {
      const containerHeight = container.clientHeight;
      const currentOffset = current.offsetTop + current.clientHeight / 2;
      container.scrollTop = currentOffset - containerHeight / 2;
    });
  }, []);

    const scrollToToday = () => {
    setUpVisibleMonths(today);

    // Wait until DOM updates
    requestAnimationFrame(() => {
      const container = containerRef.current;
      const current = currentMonthRef.current;
      if (!container || !current) return;

      const containerHeight = container.clientHeight;
      const currentOffset = current.offsetTop + current.clientHeight / 2;

      // Smoothly scroll the current month to the middle of the container
      container.scrollTo({
        top: currentOffset - containerHeight / 2,
        behavior: "smooth"
      });
    });
  };

  const handleDayClick = (year, month, day) => {
    if (!isAddPeriodMode || !day) return;

    const date = new Date(year, month, day);
    
    if (selectedRange.length === 0) {
      setSelectedRange([date]);
    } else if (selectedRange.length === 1) {
      const [first] = selectedRange;
      const start = first <= date ? first : date;
      const end = first <= date ? date : first;

      const newPeriod = { start, end };
      setPeriods(prev => [...prev, newPeriod]);
      savePeriodToBackend(newPeriod);
      setSelectedRange([]);
    }
  };

  const getDateRange = (start, end) => {
    const range = [];
    const step = start <= end ? 1 : -1;
    let current = new Date(start);

    while ((step > 0 && current <= end) || (step < 0 && current >= end)) {
      range.push(new Date(current));
      current.setDate(current.getDate() + step);
    }
    return range;
  };

  const isPeriodDay = (year, month, day) => {
    if (!day) return false;
    const target = new Date(year, month, day);

    return periods.some(period => {
      const start = new Date(period.start);
      const end = new Date(period.end);
      return target >= start && target <= end;
    });
  };

  const isFutureDay = (year, month, day) => {
    if (!day) return false;
    const target = new Date(year, month, day); // end of that day
    return target > today; // today is your constant new Date()
  };

  // scrolling - exit
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (window.innerWidth > 768) return;

    let startY = 0;
    let deltaY = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      deltaY = 0;
    };

    const handleTouchMove = (e) => {
      deltaY = e.touches[0].clientY - startY;
      if (deltaY > 0) {
        y.set(deltaY); // move the entire overlay down
      }
    };

    const handleTouchEnd = () => {
      if (deltaY > 100) {
        props?.onClose(); // trigger AnimatePresence exit
      } else {
        y.set(0); // reset position
      }
    };

    header.addEventListener("touchstart", handleTouchStart);
    header.addEventListener("touchmove", handleTouchMove);
    header.addEventListener("touchend", handleTouchEnd);

    return () => {
      header.removeEventListener("touchstart", handleTouchStart);
      header.removeEventListener("touchmove", handleTouchMove);
      header.removeEventListener("touchend", handleTouchEnd);
    };
  }, [props, y]);




  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        style={{ y }}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 70, damping: 15 }}
      >
        <div ref={headerRef} className={styles.header}>
          <h2>Add Cycle Mode</h2>

          <div className={styles.headerButtons}>
            <motion.button
              className={styles.todayButton}
              onClick={scrollToToday}
              whileTap={{ scale: 0.9 }}
            >
              Today
            </motion.button>
            <motion.button
              className={`${styles.addPeriodButton} ${isAddPeriodMode ? styles.active : ""}`}
              onClick={() => setIsAddPeriodMode(prev => !prev)}
              whileTap={{ scale: 0.9 }}
            >
              {isAddPeriodMode ? "Finish" : "Add Period"}
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
                key={`${year}-${month}`}
                ref={isCurrentMonth ? currentMonthRef : null}
                className={`${styles.month} ${
                  isCurrentMonth ? styles.currentMonth : ""
                }`}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0}}
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
                    <div key={index} className={`${styles.day} ${
                      day === today.getDate() &&
                      today.getMonth() === monthDate.getMonth() &&
                      today.getFullYear() === monthDate.getFullYear()
                        ? styles.currentDay
                        : ""} ${day && !isFutureDay(year, month, day) ? styles.clickable : styles.disabledDay} ${isPeriodDay(year, month, day) ? styles.periodDay : ""}`
                      } onClick={() => !isFutureDay(year, month, day) && handleDayClick(year, month, day)}>
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
