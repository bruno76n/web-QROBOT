/** Full-screen crop dialog: lets the owner move and zoom a photo inside the frame of its usage. */

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import Cropper, { type Area } from 'react-easy-crop';
import { aspectRatio, isSmallCrop, usageAspect, type CropRect, type PhotoUsage } from '@/lib/crop';
import { es } from '@/i18n/es';

const t = es.admin.photo;

/**
 * `src` is what the cropper shows; `usage` sets the frame shape; `original` is the real size of the
 * photo (crop values are in its pixels); `onDone` receives the chosen crop.
 */
interface Props {
  /** Same-origin URL (or blob URL) of the original. */
  src: string;
  usage: PhotoUsage;
  original: { width: number; height: number };
  /** Crop to start from (the one saved); the centered one when missing. */
  initial: CropRect | null;
  onCancel: () => void;
  onDone: (crop: CropRect) => void;
}

/** Product crops may reach past the photo (empty margins); the others stay inside it. */
const round = (a: Area, pad: boolean): CropRect => ({
  x: pad ? Math.round(a.x) : Math.max(0, Math.round(a.x)),
  y: pad ? Math.round(a.y) : Math.max(0, Math.round(a.y)),
  width: Math.max(1, Math.round(a.width)),
  height: Math.max(1, Math.round(a.height)),
});

/**
 * Smallest zoom of a product photo: the one where the whole photo fits in the square frame
 * (short side ÷ long side), a little further so it keeps some air around it.
 */
const productMinZoom = (o: { width: number; height: number }) =>
  Math.max(0.2, (Math.min(o.width, o.height) / Math.max(o.width, o.height)) * 0.85);

/**
 * Full-screen cropper (docs/12 §3): move, zoom up to 4×, pinch, and a live preview of how the
 * photo will look (docs/12 §4). Product photos may be zoomed out past the photo's edges.
 */
export function PhotoCropper({ src, usage, original, initial, onCancel, onDone }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  /** Position of the image under the frame (react-easy-crop's own coordinates). */
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  /** Crop rectangle in original-photo pixels; starts from the saved crop. */
  const [area, setArea] = useState<CropRect | null>(initial);
  /** Frame shape for the usage, and whether it may reach past the photo. */
  const aspect = aspectRatio(usageAspect[usage]);
  const pad = usage === 'product';
  const minZoom = pad ? productMinZoom(original) : 1;

  // Opens as a modal as soon as it is mounted.
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  /** The crop being shown (the user's, or the saved one until they move), and whether it is low-resolution. */
  const current = area ?? initial;
  const small = current ? isSmallCrop(current.width, usage) : false;

  // Preview: the crop painted with CSS from the original (no canvas needed while dragging).
  const previewStyle = current
    ? {
        backgroundImage: `url(${src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${(original.width / current.width) * 100}cqw auto`,
        backgroundPosition: `${(-current.x / current.width) * 100}cqw ${(-current.y / current.width) * 100}cqw`,
      }
    : undefined;

  return (
    <dialog
      ref={dialog}
      className="dlg crop"
      aria-label={t.cropTitle}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <div className="crop-body">
        <div className={cn('crop-stage', usage !== 'product' && 'guide-zone')}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            minZoom={minZoom}
            restrictPosition={!pad}
            maxZoom={4}
            aspect={aspect}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(round(pixels, pad))}
            {...(initial ? { initialCroppedAreaPixels: initial } : {})}
          />
        </div>
        <div className="crop-tools">
          <p style={{ margin: 0 }}>{pad ? t.cropHelpProduct : t.cropHelp}</p>
          <label>
            <span className="vh">{t.zoom}</span>
            <input
              type="range"
              min={minZoom}
              max={4}
              step={0.01}
              value={zoom}
              aria-label={t.zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
          {small ? <p className="crop-warn">{t.small}</p> : null}
          <div className="crop-prev">
            {usage === 'product' ? (
              <>
                <h3>{t.previewCard}</h3>
                <div className="card" style={{ containerType: 'inline-size' }}>
                  <div style={{ width: '100%', height: '100%', ...previewStyle }} />
                </div>
                <p className="nm-card">
                  {t.cardName}
                  <small>{t.cardPrice}</small>
                </p>
              </>
            ) : (
              <>
                <h3>{usage === 'hero_desktop' ? t.previewHero : t.previewHeroMobile}</h3>
                <div className={cn('hero', usage === 'hero_mobile' && 'm')}>
                  <div style={{ position: 'absolute', inset: 0, ...previewStyle }} />
                  <span className="zone" aria-hidden="true" />
                  <span className="nm" aria-hidden="true">
                    Quick Robot
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="crop-foot">
        <button type="button" className="b" onClick={onCancel}>
          {t.cancel}
        </button>
        <button
          type="button"
          className="b pri"
          disabled={!current}
          onClick={() => current && onDone(current)}
        >
          {t.done}
        </button>
      </div>
    </dialog>
  );
}
