import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-0.5',
  {
    variants: {
      variant: {
        default:
          'border border-primary/30 bg-primary text-primary-foreground shadow-soft hover:shadow-glow hover:brightness-105',
        destructive:
          'bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 hover:shadow-elevated',
        outline:
          'border border-white/10 bg-white/[0.04] text-foreground shadow-card backdrop-blur hover:border-primary/45 hover:bg-primary/10 hover:text-primary',
        secondary:
          'border border-white/10 bg-secondary/85 text-secondary-foreground shadow-card hover:bg-secondary',
        ghost:
          'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:translate-y-0 hover:underline',
        success:
          'bg-success text-success-foreground shadow-soft hover:bg-success/90 hover:shadow-glow',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-full px-3 text-xs',
        lg: 'h-12 rounded-full px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
