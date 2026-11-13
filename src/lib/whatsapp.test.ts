import { describe, expect, it } from 'vitest';
import {
  learnMissMessage,
  learnQuoteMessage,
  orderMessage,
  productMessage,
  q404Message,
  waLink,
} from './whatsapp';

const llaveros = {
  unitSingular: 'llavero',
  unitPlural: 'llaveros',
  productName: 'Llaveros con nombre',
};
const url = 'https://quickrobot.example/producto/llaveros-con-nombre';

describe('productMessage', () => {
  it('1. with color and personalization, quantity 3 (docs/05 §5 example)', () => {
    expect(
      productMessage({
        ...llaveros,
        quantity: 3,
        color: 'verde',
        personal: { hint: 'Nombre (hasta 10 letras)', answer: 'SOFI' },
        url,
      }),
    ).toBe(
      'Hola, me interesa: 3 llaveros en verde (Nombre (hasta 10 letras): SOFI). ¿Cuánto me sale y para cuándo lo tendrían?\nhttps://quickrobot.example/producto/llaveros-con-nombre',
    );
  });
  it('2. without colors, quantity 1 → no " en …"', () => {
    expect(productMessage({ ...llaveros, quantity: 1, url })).toBe(
      `Hola, me interesa: 1 llavero. ¿Cuánto me sale y para cuándo lo tendrían?\n${url}`,
    );
  });
  it('skips the personalization part when the answer is empty', () => {
    expect(
      productMessage({ ...llaveros, quantity: 2, personal: { hint: 'Nombre', answer: '  ' }, url }),
    ).not.toContain('(');
  });
});

describe('orderMessage', () => {
  it('3. without name and without details', () => {
    expect(
      orderMessage({
        quantity: 1,
        piece: ['figura', 'figuras'],
        con: 'una foto',
        when: 'lo antes posible',
      }),
    ).toBe(
      'Hola, necesito 1 figura con una foto. Lo necesito lo antes posible.\n(Lo vi en su página.)',
    );
  });
  it('4. with name and details', () => {
    expect(
      orderMessage({
        name: 'Ana',
        quantity: 20,
        piece: ['servilletero', 'servilleteros'],
        con: 'mi logo',
        when: 'antes de Navidad',
        details: 'En negro, con el logo al frente',
      }),
    ).toBe(
      'Hola, soy Ana y necesito 20 servilleteros con mi logo. Lo necesito antes de Navidad.\nDetalles: En negro, con el logo al frente\n(Lo vi en su página.)',
    );
  });
});

describe('q404Message', () => {
  it('5. "Rosa y menta" → lowercase', () => {
    expect(q404Message('Rosa y menta')).toBe(
      'Hola, quiero un Q-404 en rosa y menta. ¿Cuánto cuesta y cuándo lo tendrían?',
    );
  });
});

describe('waLink', () => {
  it('7. encodes special characters, emojis and line breaks', () => {
    const msg = 'Hola & adiós #1 😀\nSegunda línea ¿ok?';
    const link = waLink('5233000000', msg);
    expect(link.startsWith('https://wa.me/5233000000?text=')).toBe(true);
    const encoded = link.split('?text=')[1] ?? '';
    expect(encoded).not.toMatch(/[ &#\n]/);
    expect(encoded).toContain('%0A');
    expect(encoded).toContain('%26');
    expect(encoded).toContain('%23');
    expect(decodeURIComponent(encoded)).toBe(msg);
  });
});

describe('Aprende messages', () => {
  it('quote from a page', () => {
    expect(learnQuoteMessage('PETG')).toBe(
      'Hola, vi «PETG» en su página y quiero cotizar una pieza.',
    );
  });
  it('a search with no answer', () => {
    expect(learnMissMessage('  boquilla rara ')).toBe(
      'Hola, busqué «boquilla rara» en Aprende y no encontré la respuesta.',
    );
  });
});
