export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "pd_theme";

export function getStoredTheme(): ThemePreference {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : "system";
}

export function applyTheme(theme: ThemePreference): void {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

export function setTheme(theme: ThemePreference): void {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}
