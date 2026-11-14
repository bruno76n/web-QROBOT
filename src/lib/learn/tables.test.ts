import { describe, expect, it } from 'vitest';
import {
  countText,
  fillText,
  filamentVisible,
  printerLiters,
  splitMaterial,
  type FilamentRow,
} from './tables';

describe('splitMaterial', () => {
  it.each([
    ['PLA (Basic, Mate, Seda, Tough)', 'PLA', 'Basic, Mate, Seda, Tough'],
    ['TPU 95A', 'TPU', '95A'],
    ['PC (policarbonato)', 'PC', 'policarbonato'],
    ['PA6-CF / PAHT-CF (nylon con fibra)', 'PA6-CF', '/ PAHT-CF (nylon con fibra)'],
    ['PVA / BVOH', 'PVA', '/ BVOH'],
    ['ABS', 'ABS', ''],
  ])('%s', (material, name, note) => {
    expect(splitMaterial(material)).toEqual({ name, note });
  });
});

const row = (over: Partial<FilamentRow>): FilamentRow => ({
  material: 'X',
  slug: 'filamentos/x',
  uses: '',
  nozzleC: '',
  bedC: '',
  hdtC: 60,
  impactKjM2: null,
  stiffnessMpa: null,
  waterPct: null,
  drying: '',
  maxSpeedMmS: null,
  printer: 'any',
  hardenedNozzle: 'no',
  ams: 'yes',
  filters: ['exterior'],
  ...over,
});
const toggles = [
  { id: 'open', label: 'Mi impresora es abierta', hideWhen: { printer: 'enclosed' } },
  { id: 'ams', label: 'Uso AMS', hideWhen: { ams: 'no' } },
  { id: 'brass', label: 'Solo boquilla de latón', hideWhen: { hardenedNozzle: 'yes' } },
];

describe('filamentVisible', () => {
  it('a chip shows only the rows that have it; «todos» shows every one', () => {
    expect(filamentVisible(row({}), { chip: 'exterior', toggles: [] }, toggles)).toBe(true);
    expect(filamentVisible(row({}), { chip: 'calor', toggles: [] }, toggles)).toBe(false);
    expect(filamentVisible(row({}), { chip: 'todos', toggles: [] }, toggles)).toBe(true);
  });
  it('«Mi impresora es abierta» hides «enclosed» and keeps «enclosed-better»', () => {
    const open = { chip: 'todos', toggles: ['open'] };
    expect(filamentVisible(row({ printer: 'enclosed' }), open, toggles)).toBe(false);
    expect(filamentVisible(row({ printer: 'enclosed-better' }), open, toggles)).toBe(true);
    expect(filamentVisible(row({ printer: 'any' }), open, toggles)).toBe(true);
  });
  it('«Uso AMS» hides the ones that do not go in it; «dry» stays', () => {
    const ams = { chip: 'todos', toggles: ['ams'] };
    expect(filamentVisible(row({ ams: 'no' }), ams, toggles)).toBe(false);
    expect(filamentVisible(row({ ams: 'dry' }), ams, toggles)).toBe(true);
  });
  it('«Solo boquilla de latón» hides the ones that need a hardened nozzle', () => {
    expect(
      filamentVisible(
        row({ hardenedNozzle: 'yes' }),
        { chip: 'todos', toggles: ['brass'] },
        toggles,
      ),
    ).toBe(false);
  });
  it('switches add up with the chip', () => {
    const f = { chip: 'exterior', toggles: ['open', 'brass'] };
    expect(filamentVisible(row({ printer: 'enclosed' }), f, toggles)).toBe(false);
    expect(filamentVisible(row({ printer: 'enclosed-better' }), f, toggles)).toBe(true);
  });
});

describe('printerLiters', () => {
  it('256³ mm is 16.8 L', () => {
    expect(printerLiters({ widthMm: 256, depthMm: 256, heightMm: 256 })).toBeCloseTo(16.78, 2);
  });
});

describe('countText and fillText', () => {
  const forms = { one: '1 material', many: '{n} materiales' };
  it('one and many', () => {
    expect(countText(1, forms)).toBe('1 material');
    expect(countText(0, forms)).toBe('0 materiales');
    expect(countText(11, forms)).toBe('11 materiales');
  });
  it('fills every placeholder and leaves unknown ones', () => {
    expect(fillText('Cabe en {n} de {m} impresoras.', { n: 3, m: 30 })).toBe(
      'Cabe en 3 de 30 impresoras.',
    );
    expect(fillText('{x} y {n}', { n: 1 })).toBe('{x} y 1');
  });
});
