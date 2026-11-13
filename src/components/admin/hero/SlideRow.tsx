/** One sortable slide row of the hero editor. */

/* eslint-disable react-hooks/refs -- dnd-kit's `useSortable` returns ref callbacks that the React Compiler lint flags wrongly */
import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { es } from '@/i18n/es';
import type { PhotoItem } from '../photos/usePhotos';
import type { SlideItem, Slot } from './slides';

const t = es.admin.hero;

/**
 * `slide` is the slide shown; `index` its position; `active` marks the one in the preview. Callbacks:
 * select the slide, pick a file for a slot, open the cropper for a slot, and remove the phone photo or the whole slide.
 */
interface Props {
  slide: SlideItem;
  index: number;
  active: boolean;
  onSelect: () => void;
  onPick: (slot: Slot, file: File) => void;
  onCenter: (slot: Slot) => void;
  onRemoveMobile: () => void;
  onRemove: () => void;
}

/** Thumbnail of one photo with its label, an error or "preparing" text, and a progress bar while it is working. */
const Thumb = ({ item, label }: { item: PhotoItem; label: string }) => (
  <>
    {item.status === 'error' ? (
      <em>{item.error}</em>
    ) : item.previewUrl ? (
      <img src={item.previewUrl} alt="" />
    ) : (
      <em>{es.admin.photo.preparing}</em>
    )}
    <span>{label}</span>
    {item.status === 'preparing' || item.status === 'uploading' ? (
      <i
        role="progressbar"
        aria-valuenow={Math.round(item.progress * 100)}
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: 4,
          background: 'var(--purple)',
          width: `${Math.max(8, item.progress * 100)}%`,
        }}
      />
    ) : null}
  </>
);

/**
 * One row of the hero list: grip, desktop photo, phone photo and its actions (docs/12 §5).
 * Photo actions are disabled until the photo is ready. The phone photo is optional.
 */
export function SlideRow({
  slide,
  index,
  active,
  onSelect,
  onPick,
  onCenter,
  onRemoveMobile,
  onRemove,
}: Props) {
  const s = useSortable({ id: slide.key });
  const desktopInput = useRef<HTMLInputElement>(null);
  const mobileInput = useRef<HTMLInputElement>(null);
  const ready = slide.desktop.status === 'ready';

  /** Hidden file input for a slot; the action buttons click it. Its value is cleared so the same file can be chosen again. */
  const picker = (slot: Slot, ref: React.RefObject<HTMLInputElement | null>) => (
    <input
      ref={ref}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
      hidden
      aria-label={slot === 'desktop' ? t.change : t.addMobile}
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) onPick(slot, file);
      }}
    />
  );

  return (
    <li
      ref={s.setNodeRef}
      style={{ transform: CSS.Transform.toString(s.transform), transition: s.transition }}
      className={cn('sl', active && 'on', s.isDragging && 'drag')}
    >
      <button
        type="button"
        className="grip n"
        aria-label={`${es.admin.list.grip} (${index + 1})`}
        onClick={onSelect}
        {...s.attributes}
        {...s.listeners}
      >
        {index + 1}
      </button>
      <div className="d">
        <Thumb item={slide.desktop} label={t.slideDesktop} />
      </div>
      <div className="m">
        {slide.mobile ? <Thumb item={slide.mobile} label={t.slideMobile} /> : <em>{t.noMobile}</em>}
      </div>
      <div className="hint2">
        {slide.desktop.small ? <span>{es.admin.photo.small}</span> : null}
      </div>
      <div className="acts">
        {picker('desktop', desktopInput)}
        {picker('mobile', mobileInput)}
        <button
          type="button"
          className="b"
          disabled={!ready}
          onClick={() => desktopInput.current?.click()}
        >
          {t.change}
        </button>
        <button type="button" className="b" disabled={!ready} onClick={() => onCenter('desktop')}>
          {t.center}
        </button>
        {slide.mobile ? (
          <>
            <button type="button" className="b" onClick={() => mobileInput.current?.click()}>
              {t.addMobile.replace('Subir', 'Cambiar')}
            </button>
            <button
              type="button"
              className="b"
              disabled={slide.mobile.status !== 'ready'}
              onClick={() => onCenter('mobile')}
            >
              {t.center} · {t.slideMobile}
            </button>
            <button type="button" className="b ghost" onClick={onRemoveMobile}>
              {t.remove} · {t.slideMobile}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="b"
            disabled={!ready}
            onClick={() => mobileInput.current?.click()}
          >
            {t.addMobile}
          </button>
        )}
        <button type="button" className="b ghost dan" onClick={onRemove}>
          {t.remove}
        </button>
      </div>
    </li>
  );
}
