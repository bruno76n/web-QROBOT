import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins truthy class names and drops falsy ones', () => {
    const off = Boolean(process.env.NEVER_SET_FLAG);
    expect(cn('a', off && 'b', undefined, 'c')).toBe('a c');
  });
  it('lets the later Tailwind class win', () => {
    expect(cn('px-6', 'px-4')).toBe('px-4');
  });
});
