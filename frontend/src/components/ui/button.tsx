import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/format";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-45 px-4 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-brand text-card hover:bg-brand-hover",
        secondary: "bg-ink text-card hover:bg-ink/90",
        outline: "border border-line bg-card text-ink hover:bg-soft",
        ghost: "text-sec hover:bg-soft hover:text-ink",
        destructive: "bg-red-700 text-white hover:bg-red-800",
      },
      size: {
        default: "h-10 min-h-[40px] px-4",
        sm: "h-9 min-h-[36px] px-3 text-xs",
        lg: "h-11 min-h-[44px] px-5 text-sm",
        hero: "min-h-[64px] w-full rounded-xl px-6 py-4 text-base font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";
