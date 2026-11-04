/**
 * "Interactive Hover Links" from 21st.dev, delivered by the owner (docs/11 §4).
 * Changes from the delivered file, all allowed by docs/11 §4 rules 1 and 5 (see docs/decisiones.md):
 *  - the demo data (English texts, images from another domain) is gone: `links` is required;
 *  - the section no longer adds its own padding (the page section already spaces it);
 *  - the image is decorative (`alt=""`; the row text names it) and loads lazily;
 *  - MANDATORY CHANGE: on touch screens (`(hover: none)` or ≤ 760 px) the photo of the row nearest
 *    to the vertical middle of the screen is shown while scrolling; with a mouse nothing changes.
 */
import { useMotionValue, motion, useSpring, useTransform } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export interface InteractiveLink {
  heading: string;
  imgSrc: string;
  subheading: string;
  href: string;
}

interface InteractiveHoverLinksProps {
  links: InteractiveLink[];
}

const TOUCH_QUERY = '(hover: none), (max-width: 760px)';

export function InteractiveHoverLinks({ links }: InteractiveHoverLinksProps) {
  const [touch, setTouch] = useState(false);
  const [nearest, setNearest] = useState<number | null>(null);
  const rows = useRef<(HTMLAnchorElement | null)[]>([]);

  // Touch screens: follow the row nearest to the middle of the screen (mandatory change).
  useEffect(() => {
    const query = window.matchMedia(TOUCH_QUERY);
    let frame = 0;
    const update = () => {
      frame = 0;
      setTouch(query.matches);
      if (!query.matches) return setNearest(null);
      const mid = window.innerHeight / 2;
      let best: number | null = null;
      let bestDistance = Infinity;
      rows.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (r.bottom > 0 && r.top < window.innerHeight && d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      setNearest(best);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-5xl">
        {links.map((link, i) => (
          <Link
            key={link.href}
            {...link}
            touch={touch}
            active={nearest === i}
            innerRef={(el) => void (rows.current[i] = el)}
          />
        ))}
      </div>
    </section>
  );
}

interface LinkProps extends InteractiveLink {
  touch: boolean;
  active: boolean;
  innerRef: (el: HTMLAnchorElement | null) => void;
}

function Link({ heading, imgSrc, subheading, href, touch, active, innerRef }: LinkProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const top = useTransform(mouseYSpring, [0.5, -0.5], ['40%', '60%']);
  const left = useTransform(mouseXSpring, [0.5, -0.5], ['60%', '40%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const rect = ref.current!.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  return (
    <motion.a
      href={href}
      ref={(el) => {
        ref.current = el;
        innerRef(el);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      initial="initial"
      // Touch: the scroll decides (no hover); mouse: hover as delivered.
      {...(touch
        ? { animate: active ? 'whileHover' : 'initial', 'data-active': active ? 'true' : 'false' }
        : { whileHover: 'whileHover' })}
      className="group border-muted hover:border-foreground data-[active=true]:border-foreground relative flex items-center justify-between border-b-2 py-4 transition-colors duration-500 md:py-8"
    >
      <div>
        <motion.span
          variants={{
            initial: { x: 0 },
            whileHover: { x: -16 },
          }}
          transition={{
            type: 'spring',
            staggerChildren: 0.075,
            delayChildren: 0.25,
          }}
          className="text-muted-foreground group-hover:text-foreground group-data-[active=true]:text-foreground relative z-10 block text-4xl font-bold transition-colors duration-500 md:text-6xl"
        >
          {heading.split('').map((l, i) => (
            <motion.span
              variants={{
                initial: { x: 0 },
                whileHover: { x: 16 },
              }}
              transition={{ type: 'spring' }}
              className="inline-block"
              key={i}
            >
              {l === ' ' ? ' ' : l}
            </motion.span>
          ))}
        </motion.span>
        <span className="text-muted-foreground group-hover:text-foreground group-data-[active=true]:text-foreground relative z-10 mt-2 block text-base transition-colors duration-500">
          {subheading}
        </span>
      </div>

      <motion.img
        style={{
          top,
          left,
          translateX: '-10%',
          translateY: '-50%',
        }}
        variants={{
          initial: { scale: 0, rotate: '-12.5deg' },
          whileHover: { scale: 1, rotate: '12.5deg' },
        }}
        transition={{ type: 'spring' }}
        src={imgSrc}
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute z-0 h-24 w-32 rounded-lg object-cover shadow-lg md:h-48 md:w-64"
        alt=""
      />
      <div className="overflow-hidden">
        <motion.div
          variants={{
            initial: {
              x: '100%',
              opacity: 0,
            },
            whileHover: {
              x: '0%',
              opacity: 1,
            },
          }}
          transition={{ type: 'spring' }}
          className="relative z-10 p-4"
        >
          <ArrowRight aria-hidden="true" className="text-foreground size-8 md:size-12" />
        </motion.div>
      </div>
    </motion.a>
  );
}
