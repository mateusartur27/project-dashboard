import { useState } from "react";
import { getStoredTheme, setTheme, type ThemePreference } from "../lib/theme";
import "./theme-toggle.css";

const OPTIONS: Array<{ value: ThemePreference; icon: string; label: string }> = [
  { value: "light", icon: "☀", label: "Claro" },
  { value: "dark", icon: "☾", label: "Escuro" },
  { value: "system", icon: "🖥", label: "Sistema" },
];

export function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const [theme, setThemeState] = useState<ThemePreference>(() => getStoredTheme());

  function choose(value: ThemePreference) {
    setTheme(value);
    setThemeState(value);
  }

  return (
    <div className={`theme-toggle ${collapsed ? "theme-toggle-collapsed" : ""}`}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`theme-toggle-btn ${theme === option.value ? "theme-toggle-btn-active" : ""}`}
          onClick={() => choose(option.value)}
          title={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
