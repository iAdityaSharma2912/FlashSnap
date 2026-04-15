import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-dark hover:bg-primary/90 hover:shadow-glow-yellow hover:-translate-y-0.5",
        secondary:
          "bg-dark-card border border-dark-border text-gray-200 hover:bg-dark-muted hover:border-gray-600 hover:-translate-y-0.5",
        ghost:
          "text-gray-400 hover:text-gray-200 hover:bg-dark-muted",
        accent:
          "bg-accent text-dark hover:bg-accent/90 hover:shadow-glow-green hover:-translate-y-0.5",
        orange:
          "bg-orange text-white hover:bg-orange-dark hover:shadow-glow-orange hover:-translate-y-0.5",
        destructive:
          "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20",
        outline:
          "border border-primary/40 text-primary hover:bg-primary/10",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base rounded-2xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
