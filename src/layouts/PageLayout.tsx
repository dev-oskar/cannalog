import { type ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

export function PageLayout({
  children,
  title,
  subtitle,
  headerActions,
  maxWidth = "lg",
}: PageLayoutProps) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-none",
  }[maxWidth];

  return (
    <div className={`container mx-auto px-4 py-6 ${maxWidthClass}`}>
      {(title || headerActions) && (
        <div className="flex justify-between items-start mb-6">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
            )}
            {subtitle && <p className="text-secondary text-sm">{subtitle}</p>}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
