import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary/20 text-primary border border-primary/30",
        accent: "bg-accent/20 text-accent border border-accent/30",
        orange: "bg-orange/20 text-orange border border-orange/30",
        muted: "bg-dark-muted text-gray-400 border border-dark-border",
        easy: "bg-accent/15 text-accent border border-accent/25",
        medium: "bg-primary/15 text-primary border border-primary/25",
        hard: "bg-orange/15 text-orange border border-orange/25",
        new: "bg-gray-700/40 text-gray-400 border border-gray-700",
        learning: "bg-orange/15 text-orange border border-orange/25",
        reviewing: "bg-primary/15 text-primary border border-primary/25",
        mastered: "bg-accent/15 text-accent border border-accent/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
