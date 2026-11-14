/**
 * The sample data of the screen «Inicio» agree with the rest (docs/25 §12): the date written in
 * its header is the day of the sample workshop, the purchases counter of the menu is the number of
 * suggested items, the jobs printing fit in the printers, and the order #3 being printed and
 * delivered is the one of the order screen.
 */
import { describe, expect, it } from 'vitest';
import {
  demoBusiness,
  demoDeliveries,
  demoMenuCounts,
  demoOrder3,
  demoPrinting,
  demoPurchases,
  demoTodayLabel,
} from '@/config/system-demo';

describe('sample data of «Inicio»', () => {
  it('the header date is the day of the sample workshop', () => {
    const day = new Date(`${demoBusiness.today}T12:00:00Z`);
    const label = new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    })
      .format(day)
      .replace(',', '');
    expect(demoTodayLabel.toLowerCase()).toBe(label);
  });

  it('the purchases counter is the number of suggested items', () => {
    const items = demoPurchases.reduce((n, s) => n + s.items.length, 0);
    expect(demoMenuCounts.purchases).toBe(items);
    expect(items).toBe(4);
  });

  it('the jobs printing fit in the printers, each on its own printer', () => {
    const printers = new Set(demoPrinting.jobs.map((j) => j.printer));
    expect(printers.size).toBe(demoPrinting.jobs.length);
    expect(demoPrinting.jobs.length).toBeLessThanOrEqual(demoPrinting.printers);
    for (const j of demoPrinting.jobs) {
      expect(j.progress).toBeGreaterThan(0);
      expect(j.progress).toBeLessThan(100);
    }
  });

  it('order #3 is the one of the order screen, with its customer and date of delivery', () => {
    const d = demoDeliveries.find((x) => x.order === demoOrder3.number);
    expect(d).toEqual({
      date: demoOrder3.due,
      customer: demoOrder3.customer,
      order: demoOrder3.number,
      state: 'inProduction',
    });
    expect(demoPrinting.jobs.every((j) => j.order === demoOrder3.number)).toBe(true);
  });
});
