import { describe, expect, it } from 'vitest';
import { detectPlatform } from './platform';

const ua = {
  safariMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  chromeMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  edgeWin:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
  chromeWin:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  iphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  linux:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
};

describe('detectPlatform', () => {
  it.each([
    [ua.safariMac, 'mac'],
    [ua.chromeMac, 'mac'],
    [ua.edgeWin, 'windows'],
    [ua.chromeWin, 'windows'],
    [ua.iphone, 'mobile'],
    [ua.android, 'mobile'],
    // iPad on iPadOS asks for the desktop site and presents itself as a Mac: accepted.
    [ua.safariMac, 'mac'],
    [ua.linux, 'other'],
    ['', 'other'],
    [null, 'other'],
  ])('%s → %s', (agent, expected) => {
    expect(detectPlatform(agent)).toBe(expected);
  });
});
