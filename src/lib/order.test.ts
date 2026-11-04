import { describe, expect, it } from 'vitest';
import { defaultOrder, orderStateMessage, parseOrderHash } from './order';

describe('parseOrderHash', () => {
  it('flow B: "servilleteros" → 20 · servilleteros · mi logo', () => {
    expect(parseOrderHash('#pedido=servilleteros')).toEqual({
      quantity: 20,
      piece: 0,
      with: 0,
      when: 0,
    });
  });
  it('every idea of docs/05 §3 fills what the table says', () => {
    expect(parseOrderHash('#pedido=numeros-de-mesa')).toEqual({
      quantity: 15,
      piece: 1,
      with: 0,
      when: 0,
    });
    expect(parseOrderHash('#pedido=porta-qr')).toEqual({
      quantity: 10,
      piece: 2,
      with: 0,
      when: 0,
    });
    expect(parseOrderHash('#pedido=llaveros')).toEqual({
      quantity: 10,
      piece: 3,
      with: 1,
      when: 0,
    });
    expect(parseOrderHash('#pedido=figuras')).toEqual({ quantity: 1, piece: 4, with: 2, when: 0 });
    expect(parseOrderHash('#pedido=adornos-de-navidad')).toEqual({
      quantity: 1,
      piece: 5,
      with: 3,
      when: 1,
    });
    expect(parseOrderHash('#pedido=lo-que-se-te-ocurra')).toEqual({
      quantity: 1,
      piece: 6,
      with: 3,
      when: 0,
    });
  });
  it('"Apartar un regalo": 1 · figura · una foto · antes de Navidad', () => {
    expect(parseOrderHash('#pedido=navidad')).toEqual({ quantity: 1, piece: 4, with: 2, when: 1 });
  });
  it('ignores other hashes and unknown ideas', () => {
    for (const h of ['', '#pedido', '#ideas', '#pedido=nada', '#pedido=<script>'])
      expect(parseOrderHash(h), h).toBeNull();
  });
});

describe('orderStateMessage', () => {
  it('flow B message', () => {
    const idea = parseOrderHash('#pedido=servilleteros');
    expect(orderStateMessage({ ...defaultOrder, ...idea })).toBe(
      'Hola, necesito 20 servilleteros con mi logo. Lo necesito lo antes posible.\n(Lo vi en su página.)',
    );
  });
  it('plural follows the quantity', () => {
    expect(orderStateMessage({ ...defaultOrder, quantity: 1, piece: 3, with: 1 })).toContain(
      'necesito 1 llavero con un nombre',
    );
    expect(orderStateMessage({ ...defaultOrder, quantity: 2, piece: 3 })).toContain(
      'necesito 2 llaveros',
    );
  });
  it('with name and details', () => {
    expect(
      orderStateMessage({
        ...defaultOrder,
        name: 'Taquería Los Primos',
        quantity: 20,
        details: 'En negro',
      }),
    ).toBe(
      'Hola, soy Taquería Los Primos y necesito 20 servilleteros con mi logo. Lo necesito lo antes posible.\nDetalles: En negro\n(Lo vi en su página.)',
    );
  });
  it('survives nonsense indexes and quantities', () => {
    expect(
      orderStateMessage({ ...defaultOrder, quantity: NaN, piece: 99, with: -1, when: 7 }),
    ).toBe(
      'Hola, necesito 1 servilletero con mi logo. Lo necesito lo antes posible.\n(Lo vi en su página.)',
    );
  });
});
