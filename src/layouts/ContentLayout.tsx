import { type ReactNode } from "react";

interface ContentLayoutProps {
  children: ReactNode;
  variant?: "default" | "card" | "form" | "split";
  className?: string;
}

export function ContentLayout({
  children,
  variant = "default",
  className = "",
}: ContentLayoutProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "card":
        return "bg-background/80 rounded-lg shadow-sm border border-primary/10 p-6";
      case "form":
        return "bg-background/80 rounded-lg shadow-sm border border-primary/10 p-6 max-w-md mx-auto";
      case "split":
        return "grid grid-cols-1 lg:grid-cols-2 gap-6";
      default:
        return "";
    }
  };

  return (
    <div className={`${getVariantClasses()} ${className}`}>{children}</div>
  );
}
