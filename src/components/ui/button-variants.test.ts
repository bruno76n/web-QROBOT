import { describe, expect, it } from 'vitest';
import { buttonVariants } from './button-variants';

describe('buttonVariants', () => {
  it('is rectangular with the 8 px radius token and never fully rounded', () => {
    const classes = buttonVariants();
    expect(classes).toContain('rounded-btn');
    expect(classes).not.toContain('rounded-full');
  });
  it('black is the default and green is the WhatsApp variant', () => {
    expect(buttonVariants()).toContain('bg-ink');
    expect(buttonVariants({ variant: 'green' })).toContain('bg-green');
  });
});
