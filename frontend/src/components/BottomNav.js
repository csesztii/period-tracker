import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  const navItems = [
    { path: "/articles", label: "Articles" },
    { path: "/pregnancy", label: "Pregnancy" },
    { path: "/", label: "Cycles" },
    { path: "/page3", label: "Page 3" }, // <-- Corrected this to match App.js
    { path: "/user", label: "User" },
  ]

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
