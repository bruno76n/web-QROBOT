/**
 * The jobs printing now are the same in every system screen that shows them (docs/25 §4): the home
 * screen («En impresión»), order #3 and the printers screen.
 */
import { describe, expect, it } from 'vitest';
import { demoOrder3Detail, demoPrinters, demoPrinting } from '@/config/system-demo';

describe('jobs printing now', () => {
  it('agree between the home screen, order #3 and the printers screen', () => {
    for (const job of demoPrinting.jobs) {
      const minutes = job.left.h * 60 + job.left.min;
      const item = demoOrder3Detail.items.find((i) => i.printer === job.printer);
      expect(item, job.printer).toBeDefined();
      expect(item?.progress).toBe(job.progress);
      expect(item?.minutesLeft).toBe(minutes);
      const printer = demoPrinters.find((p) => p.name === job.printer);
      expect(printer?.current?.progress, job.printer).toBe(job.progress);
      expect(printer?.current?.left).toEqual(job.left);
      expect(printer?.current?.piece).toBe(job.piece);
    }
  });
});
