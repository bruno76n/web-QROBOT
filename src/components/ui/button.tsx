import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { arrowClass, buttonVariants, type ButtonVariantProps } from './button-variants';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  /** Render the child element (a link, for example) with the button look. */
  asChild?: boolean;
  /** Show the `→` that slides on hover. */
  arrow?: boolean;
}

/** shadcn/ui-style Button adapted to the Quick Robot tokens (docs/03 §4). */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, arrow = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);
    if (asChild) {
      return (
        <Slot className={classes} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }
    return (
      <button className={classes} ref={ref} {...props}>
        {children}
        {arrow ? <ArrowRight aria-hidden="true" className={cn('size-[1em]', arrowClass)} /> : null}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button };
