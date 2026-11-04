import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Simple replacement for the external "Interactive Hover Links" component (docs/11 §4): a list of
 * links with name and phrase, and the photo next to the row. Same data as the real one. When the
 * owner's file arrives it replaces this one in `index.ts` (last step of phase 5).
 */
export interface HoverLinkItem {
  title: string;
  description: string;
  image: { src: string; width: number; height: number };
  href: string;
}

export default function HoverLinks({ items }: { items: HoverLinkItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  // Touch screens: the photo of the row nearest to the middle of the screen while scrolling.
  useEffect(() => {
    const touch = window.matchMedia('(hover: none), (max-width: 760px)');
    if (!touch.matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      let best: number | null = null;
      let bestDistance = Infinity;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (r.bottom > 0 && r.top < window.innerHeight && d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ul className="idx">
      {items.map((item, i) => (
        <li key={item.href} ref={(el) => void (refs.current[i] = el)}>
          <a
            className={cn('row', active === i && 'act')}
            href={item.href}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive((v) => (v === i ? null : v))}
            onFocus={() => setActive(i)}
            onBlur={() => setActive((v) => (v === i ? null : v))}
          >
            <span className="tx">
              <span className="nm">{item.title}</span>
              <span className="d">{item.description}</span>
            </span>
            <img
              className="th"
              src={item.image.src}
              width={item.image.width}
              height={item.image.height}
              alt=""
              loading="lazy"
            />
            <span className="go" aria-hidden="true">
              →
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
