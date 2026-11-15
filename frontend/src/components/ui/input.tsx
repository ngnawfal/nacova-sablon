import * as React from "react";
import { cn } from "@/lib/utils/format";

const fieldBase =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted/75 transition-[border-color,background-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-soft disabled:text-muted";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("flex h-10 min-h-[40px]", fieldBase, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("flex min-h-[88px]", fieldBase, className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn("flex h-10 min-h-[40px]", fieldBase, className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs font-normal text-sec mb-1.5", className)}
      {...props}
    />
  );
}
