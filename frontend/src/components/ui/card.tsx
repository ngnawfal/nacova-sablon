import * as React from "react";
import { cn } from "@/lib/utils/format";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-card text-ink shadow-[0_1px_2px_rgba(31,27,22,0.04)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pt-5 pb-2", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-sm font-medium text-ink", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5 pt-2", className)} {...props} />;
}

const badgeStyles = {
  neutral: "bg-soft text-sec border-line",
  success: "bg-emerald-50/80 text-emerald-700 border-emerald-700/15",
  warning: "bg-amber-50/80 text-amber-800 border-amber-700/15",
  danger: "bg-red-50/80 text-red-700 border-red-700/15",
  accent: "bg-brand-soft text-brand-hover border-brand/20",
} as const;

export function Badge({
  variant = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeStyles;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 text-xs font-medium",
        badgeStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function Alert({
  variant = "error",
  className,
  children,
}: {
  variant?: "error" | "success" | "info";
  className?: string;
  children: React.ReactNode;
}) {
  const styles =
    variant === "success"
      ? "border-emerald-700/20 bg-emerald-50/70 text-emerald-800"
      : variant === "info"
        ? "border-line bg-soft text-ink"
        : "border-red-700/20 bg-red-50/70 text-red-800";
  return (
    <div
      role="alert"
      className={cn("rounded-xl border px-4 py-3 text-sm", styles, className)}
    >
      {children}
    </div>
  );
}
