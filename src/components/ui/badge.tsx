import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-tight backdrop-blur transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
  {
    variants: {
      variant: {
        default:
          'border-primary/25 bg-primary/15 text-primary shadow-[0_0_24px_hsl(var(--primary)/0.12)]',
        secondary:
          'border-white/10 bg-white/[0.055] text-secondary-foreground',
        destructive:
          'border-destructive/25 bg-destructive/10 text-destructive',
        success: 'border-success/25 bg-success/10 text-success',
        warning:
          'border-warning/30 bg-warning/15 text-warning',
        outline: 'border-white/10 bg-transparent text-foreground',
        muted: 'border-white/10 bg-muted/70 text-muted-foreground',
        info: 'border-info/25 bg-info/10 text-info',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
