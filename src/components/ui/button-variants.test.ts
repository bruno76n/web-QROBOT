import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/cn';
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
  it('outline is white with a line border; outlineLight is see-through with a white border', () => {
    const outline = cn(buttonVariants({ variant: 'outline' }));
    expect(outline).toContain('bg-white');
    expect(outline).toContain('border-line');
    expect(outline).not.toContain('border-0');
    const light = cn(buttonVariants({ variant: 'outlineLight' }));
    expect(light).toContain('bg-transparent');
    expect(light).toContain('border-white/40');
    expect(light).not.toContain('border-0');
  });
});
