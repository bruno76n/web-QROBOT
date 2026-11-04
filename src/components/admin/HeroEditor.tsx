/* eslint-disable react-hooks/refs -- dnd-kit's `useSortable` returns ref callbacks that the React Compiler lint flags wrongly */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { HeroView } from '@/lib/admin-types';
import { isSmallCrop, type CropRect } from '@/lib/crop';
import { limits } from '@/lib/publish';
import { maxOriginalBytes } from '@/lib/photo-limits';
import { cn } from '@/lib/cn';
import { es } from '@/i18n/es';
import { useConfirm } from './ConfirmDialog';
import { SlideRow } from './hero/SlideRow';
import {
  heroFingerprint,
  isBusy,
  moveSlide,
  slidesFromView,
  slotUsage,
  toHeroInput,
  type SlideItem,
  type Slot,
} from './hero/slides';
import { PhotoCropper } from './photos/PhotoCropper';
import { photoAccept, rejectionText } from './photos/PhotoUploader';
import { ingestFile, recropPhoto } from './photos/ingest';
import { PhotoError } from './photos/pipeline';
import type { PhotoItem } from './photos/usePhotos';
import { api } from './lib/api';
import { errorText } from './lib/error-text';
import { setDirty } from './lib/dirty';
import { keys, useHero } from './lib/queries';

const t = es.admin.hero;
const intervals = [4, 6, 8, 12] as const;

const blank = (): PhotoItem => ({
  key: `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  id: null,
  alt: '',
  crop: null,
  version: null,
  widths: [],
  previewUrl: '',
  original: null,
  blob: null,
  status: 'preparing',
  progress: 0,
  error: null,
  small: false,
  retry: null,
});

const messageFor = (error: unknown) =>
  error instanceof PhotoError
    ? errorText({ ok: false, code: error.code })
    : es.admin.errors.INTERNAL('—');

export function HeroEditor() {
  const { data, isPending, error } = useHero();
  if (isPending)
    return (
      <div className="homeed" aria-busy="true">
        <div className="he">
          <div className="sk" style={{ height: 240 }} />
        </div>
      </div>
    );
  if (error || !data)
    return (
      <div className="homeed">
        <div className="he">
          <p className="offline">{errorText({ ok: false, code: 'UNAUTHORIZED' })}</p>
        </div>
      </div>
    );
  return <HeroForm initial={data} />;
}

function HeroForm({ initial }: { initial: HeroView }) {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [slides, setSlides] = useState<SlideItem[]>(() => slidesFromView(initial));
  const [interval, setIntervalSeconds] = useState<number>(initial.intervalSeconds);
  const [baseline, setBaseline] = useState(() =>
    heroFingerprint(slidesFromView(initial), initial.intervalSeconds),
  );
  const [active, setActive] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cropping, setCropping] = useState<{ key: string; slot: Slot; src: string } | null>(null);
  const slidesRef = useRef(slides);
  slidesRef.current = slides;
  const ingestRef = useRef<(key: string, slot: Slot, file: File) => Promise<void>>(async () => {});

  const dirty = heroFingerprint(slides, interval) !== baseline;
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty]);

  const patchPhoto = useCallback((key: string, slot: Slot, changes: Partial<PhotoItem>) => {
    setSlides((list) =>
      list.map((s) => {
        if (s.key !== key) return s;
        if (slot === 'desktop') return { ...s, desktop: { ...s.desktop, ...changes } };
        return s.mobile ? { ...s, mobile: { ...s.mobile, ...changes } } : s;
      }),
    );
  }, []);

  /** A file for a slot: prepare, center, upload; on failure the slot shows the error with a retry. */
  const ingest = useCallback(
    async (key: string, slot: Slot, file: File) => {
      const usage = slotUsage(slot);
      try {
        const done = await ingestFile(file, usage, (stage, fraction = 0) =>
          patchPhoto(key, slot, {
            status: stage === 'preparing' ? 'preparing' : 'uploading',
            progress: fraction,
          }),
        );
        patchPhoto(key, slot, {
          id: done.photoId,
          version: done.version,
          widths: done.widths,
          crop: done.crop,
          original: done.original,
          blob: done.blob,
          previewUrl: done.previewUrl,
          status: 'ready',
          progress: 1,
          error: null,
          small: isSmallCrop(done.crop.width, usage),
          retry: null,
        });
      } catch (err) {
        patchPhoto(key, slot, {
          status: 'error',
          error: messageFor(err),
          retry: () => void ingestRef.current(key, slot, file),
        });
      }
    },
    [patchPhoto],
  );

  useEffect(() => {
    ingestRef.current = ingest;
  }, [ingest]);

  const addFiles = useCallback(
    (files: File[]) => {
      const room = limits.maxSlides - slidesRef.current.length;
      if (room <= 0 || files.length > room) toast.error(t.tooMany);
      const accepted = files.slice(0, Math.max(0, room));
      const created = accepted.map(
        () =>
          ({
            key: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            desktop: blank(),
            mobile: null,
          }) satisfies SlideItem,
      );
      setSlides((list) => [...list, ...created]);
      created.forEach((s, i) => void ingest(s.key, 'desktop', accepted[i] as File));
    },
    [ingest],
  );

  const pick = (key: string, slot: Slot, file: File) => {
    if (slot === 'mobile') {
      setSlides((list) => list.map((s) => (s.key === key ? { ...s, mobile: blank() } : s)));
    } else {
      patchPhoto(key, 'desktop', { status: 'preparing', progress: 0, previewUrl: '', error: null });
    }
    void ingest(key, slot, file);
  };

  const recenter = async (key: string, slot: Slot, crop: CropRect) => {
    const slide = slidesRef.current.find((s) => s.key === key);
    const item = slot === 'desktop' ? slide?.desktop : slide?.mobile;
    if (!item?.id || !item.original) return;
    patchPhoto(key, slot, { status: 'uploading', progress: 0 });
    try {
      const done = await recropPhoto(
        {
          photoId: item.id,
          usage: slotUsage(slot),
          crop,
          original: item.original,
          blob: item.blob,
        },
        (fraction) => patchPhoto(key, slot, { progress: fraction }),
      );
      patchPhoto(key, slot, {
        version: done.upload.version,
        widths: done.upload.widths,
        crop,
        blob: done.blob,
        previewUrl: done.previewUrl,
        status: 'ready',
        progress: 1,
        small: isSmallCrop(crop.width, slotUsage(slot)),
      });
    } catch (err) {
      patchPhoto(key, slot, { status: 'ready', progress: 1 });
      toast.error(messageFor(err));
    }
  };

  const openCropper = (key: string, slot: Slot) => {
    const slide = slides.find((s) => s.key === key);
    const item = slot === 'desktop' ? slide?.desktop : slide?.mobile;
    if (!item?.id) return;
    setCropping({
      key,
      slot,
      src: item.blob ? URL.createObjectURL(item.blob) : `/api/admin/photo/${item.id}`,
    });
  };
  const closeCropper = () => {
    if (cropping?.src.startsWith('blob:')) URL.revokeObjectURL(cropping.src);
    setCropping(null);
  };

  const save = async () => {
    if (isBusy(slides)) return void toast.error(es.admin.actions.waitUploads);
    const input = toHeroInput(slides, interval as 4 | 6 | 8 | 12);
    if (!input) return void toast.error(es.admin.errors.PHOTO_NOT_FOUND);
    setSaving(true);
    const res = await api.saveHero(input);
    setSaving(false);
    if (!res.ok) return void toast.error(errorText(res));
    toast.success(t.saved);
    await reload();
  };

  const reload = async () => {
    const res = await api.getHero();
    if (!res.ok) return;
    const fresh = slidesFromView(res.data);
    qc.setQueryData(keys.hero, res.data);
    setSlides(fresh);
    setIntervalSeconds(res.data.intervalSeconds);
    setBaseline(heroFingerprint(fresh, res.data.intervalSeconds));
    setActive(0);
  };

  const reset = async () => {
    const yes = await confirm({
      title: t.resetTitle,
      text: t.resetText,
      yes: t.resetYes,
      no: es.admin.actions.deleteNo,
      danger: true,
    });
    if (!yes) return;
    const res = await api.resetHero();
    if (!res.ok) return void toast.error(errorText(res));
    toast.success(t.resetDone);
    await reload();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: photoAccept,
    maxSize: maxOriginalBytes,
    onDropAccepted: addFiles,
    onDropRejected: (r) => toast.error(rejectionText(r)),
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = useMemo(() => slides.map((s) => s.key), [slides]);
  const onDragEnd = ({ active: a, over }: DragEndEvent) => {
    if (!over || a.id === over.id) return;
    setSlides((list) => moveSlide(list, ids.indexOf(String(a.id)), ids.indexOf(String(over.id))));
  };

  const current = slides[Math.min(active, slides.length - 1)];
  const croppingItem = cropping ? slides.find((s) => s.key === cropping.key) : undefined;
  const croppingPhoto = cropping?.slot === 'mobile' ? croppingItem?.mobile : croppingItem?.desktop;

  return (
    <section className="homeed" aria-labelledby="he-t">
      <div className="he">
        <h1 id="he-t">{t.title}</h1>
        <p className="lead">{t.lead}</p>

        <div className="box">
          <h2>{t.preview}</h2>
          <p className="hint">{t.previewHint}</p>
          <div className="prev">
            {current?.desktop.previewUrl ? (
              <img
                src={Object.keys({}).length ? '' : current.desktop.previewUrl}
                alt={t.previewAlt}
              />
            ) : (
              <img src="/brand/hero-desktop-1200.webp" alt={t.previewAlt} />
            )}
            <span className="zone" aria-hidden="true" />
            <span className="nm" aria-hidden="true">
              Quick Robot
            </span>
            {slides.length > 0 ? (
              <span className="tag">
                {t.tag(Math.min(active, slides.length - 1) + 1, slides.length)}
              </span>
            ) : null}
          </div>
          <div className="prev-row">
            <span>{t.count(slides.length)}</span>
          </div>
        </div>

        <div className="box">
          <h2>{t.photos}</h2>
          <p className="hint">{t.photosHint}</p>
          <div {...getRootProps({ className: cn('drop', isDragActive && 'on') })}>
            <input {...getInputProps()} aria-label={t.dropTitle} />
            <span>
              <b>{t.dropTitle}</b> {t.dropOr}
            </span>
            <small>{t.dropHint}</small>
          </div>
          {slides.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <ul className="slides">
                  {slides.map((s, i) => (
                    <SlideRow
                      key={s.key}
                      slide={s}
                      index={i}
                      active={i === active}
                      onSelect={() => setActive(i)}
                      onPick={(slot, file) => pick(s.key, slot, file)}
                      onCenter={(slot) => openCropper(s.key, slot)}
                      onRemoveMobile={() =>
                        setSlides((l) =>
                          l.map((x) => (x.key === s.key ? { ...x, mobile: null } : x)),
                        )
                      }
                      onRemove={() => setSlides((l) => l.filter((x) => x.key !== s.key))}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : null}
        </div>

        <div className="box">
          <h2>{t.interval}</h2>
          <div className="row2">
            <label htmlFor="he-every">{t.every}</label>
            <select
              className="in"
              id="he-every"
              value={interval}
              onChange={(e) => setIntervalSeconds(Number(e.target.value))}
            >
              {intervals.map((n) => (
                <option key={n} value={n}>
                  {t.seconds(n)}
                </option>
              ))}
            </select>
            <span className="hint2">{t.intervalHint}</span>
          </div>
        </div>
      </div>

      <div className="save">
        <button type="button" className="b pri" disabled={saving} onClick={() => void save()}>
          {saving ? es.admin.actions.saving : t.save}
        </button>
        <a className="b" href="/" target="_blank" rel="noopener">
          {t.viewHome}
        </a>
        <span className="sp" />
        {dirty ? <span className="dirty">{es.admin.unsaved}</span> : null}
        <button type="button" className="b ghost dan" onClick={() => void reset()}>
          {t.reset}
        </button>
      </div>

      {cropping && croppingPhoto?.original ? (
        <PhotoCropper
          src={cropping.src}
          usage={slotUsage(cropping.slot)}
          original={croppingPhoto.original}
          initial={croppingPhoto.crop}
          onCancel={closeCropper}
          onDone={(crop) => {
            void recenter(cropping.key, cropping.slot, crop);
            closeCropper();
          }}
        />
      ) : null}
    </section>
  );
}
