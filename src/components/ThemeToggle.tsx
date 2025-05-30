import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-md bg-primary hover:bg-primary/80 transition-colors hover:cursor-pointer"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
