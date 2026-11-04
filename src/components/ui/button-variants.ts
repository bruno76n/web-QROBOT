import { cva, type VariantProps } from 'class-variance-authority';

/**
 * One source of truth for the button look (docs/03 §4), shared by the React `Button`
 * and the Astro `Button`. Rectangular, 8 px corners, never fully rounded.
 */
export const buttonVariants = cva(
  [
    'group/btn inline-flex cursor-pointer items-center justify-center gap-2.5 border-0',
    'rounded-btn px-6 text-base font-medium no-underline transition-colors duration-200',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        black: 'bg-ink text-white hover:bg-[#2c2c33]',
        green: 'bg-green text-ink hover:bg-[#00c24b]',
      },
      size: {
        default: 'min-h-[50px]',
        sm: 'min-h-10 px-[18px] text-[15px]',
      },
    },
    defaultVariants: { variant: 'black', size: 'default' },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/** Classes of the `→` that moves 4 px on hover. */
export const arrowClass = 'transition-transform duration-200 group-hover/btn:translate-x-1';
