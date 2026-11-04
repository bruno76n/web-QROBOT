import { describe, expect, it } from 'vitest';
import { photoImg, photoOgUrl, photoVariantUrl, type PhotoSrc } from './photos';

const photo: PhotoSrc = {
  id: 'abc',
  alt: 'x',
  version: 'v1v1v1v1',
  widths: [800, 400, 1200],
  aspect: '1:1',
};

describe('photoImg', () => {
  it('builds a srcset from the widths that exist, smallest first', () => {
    const img = photoImg(photo, '/img');
    expect(img.srcset).toBe(
      '/img/ph/abc/v1v1v1v1/400.webp 400w, /img/ph/abc/v1v1v1v1/800.webp 800w, /img/ph/abc/v1v1v1v1/1200.webp 1200w',
    );
    expect(img.src).toBe('/img/ph/abc/v1v1v1v1/800.webp');
    expect(img.width).toBe(1200);
    expect(img.height).toBe(1200);
  });
  it('never invents a width: a small photo has a single version', () => {
    const img = photoImg({ ...photo, widths: [300] }, 'https://img.quickrobot.example/');
    expect(img.srcset).toBe('https://img.quickrobot.example/ph/abc/v1v1v1v1/300.webp 300w');
    expect(img.src).toBe('https://img.quickrobot.example/ph/abc/v1v1v1v1/300.webp');
    expect(img.height).toBe(300);
  });
  it('keeps the shape of the photo (16:9 height)', () => {
    expect(photoImg({ ...photo, aspect: '16:9', widths: [1200, 2400] }, '/img').height).toBe(1350);
  });
  it('builds variant and og URLs', () => {
    expect(photoVariantUrl(photo, 400, '/img')).toBe('/img/ph/abc/v1v1v1v1/400.webp');
    expect(photoOgUrl(photo, '/img')).toBe('/img/ph/abc/v1v1v1v1/og.jpg');
  });
});
