/* eslint-disable react-hooks/refs -- dnd-kit's `useSortable` returns ref callbacks that the React Compiler lint flags wrongly */
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { useDropzone, type FileRejection } from 'react-dropzone';
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { maxOriginalBytes } from '@/lib/photo-limits';
import type { PhotoUsage } from '@/lib/crop';
import { es } from '@/i18n/es';
import { PhotoCropper } from './PhotoCropper';
import type { PhotoItem } from './usePhotos';
import type { CropRect } from '@/lib/crop';

const t = es.admin;

/** File types of the picker (iPhone photos included; they are converted in the browser). */
export const photoAccept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
};

export function rejectionText(rejections: FileRejection[]): string {
  const codes = rejections.flatMap((r) => r.errors.map((e) => e.code));
  return codes.includes('file-too-large') ? t.photo.tooLarge : t.photo.unsupported;
}

interface Props {
  photos: PhotoItem[];
  usage: PhotoUsage;
  max: number;
  onAdd: (files: File[]) => void;
  onRemove: (key: string) => void;
  onAlt: (key: string, alt: string) => void;
  onMove: (from: number, to: number) => void;
  onRecenter: (key: string, crop: CropRect) => void;
}

/** Drop zone plus the sortable thumbnails of a product (docs/12 §3). */
export function PhotoUploader({
  photos,
  usage,
  max,
  onAdd,
  onRemove,
  onAlt,
  onMove,
  onRecenter,
}: Props) {
  const [cropping, setCropping] = useState<PhotoItem | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const dropzone = useDropzone({
    accept: photoAccept,
    maxSize: maxOriginalBytes,
    onDropAccepted: onAdd,
    onDropRejected: (rejections) => toast.error(rejectionText(rejections)),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = useMemo(() => photos.map((p) => p.key), [photos]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onMove(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
  };

  const openCropper = (item: PhotoItem) => {
    setCropSrc(item.blob ? URL.createObjectURL(item.blob) : `/api/admin/photo/${item.id}`);
    setCropping(item);
  };
  const closeCropper = () => {
    if (cropSrc?.startsWith('blob:')) URL.revokeObjectURL(cropSrc);
    setCropping(null);
    setCropSrc(null);
  };
  useEffect(
    () => () => {
      if (cropSrc?.startsWith('blob:')) URL.revokeObjectURL(cropSrc);
    },
    [cropSrc],
  );

  const { getRootProps, getInputProps, isDragActive } = dropzone;
  return (
    <>
      <div {...getRootProps({ className: cn('drop', isDragActive && 'on') })}>
        <input {...getInputProps()} aria-label={t.editor.dropTitle} />
        <span>
          <b>{t.editor.dropTitle}</b> {t.editor.dropOr}
        </span>
        <small>{t.editor.dropFormats}</small>
      </div>

      {photos.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={rectSortingStrategy}>
            <ul className="photos">
              {photos.map((p, index) => (
                <Thumb
                  key={p.key}
                  item={p}
                  index={index}
                  onRemove={() => onRemove(p.key)}
                  onAlt={(alt) => onAlt(p.key, alt)}
                  onCenter={() => openCropper(p)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : null}
      <small className="hint2" style={{ display: 'block', marginTop: 8 }}>
        {photos.length}/{max}
      </small>

      {cropping && cropSrc && cropping.original ? (
        <PhotoCropper
          src={cropSrc}
          usage={usage}
          original={cropping.original}
          initial={cropping.crop}
          onCancel={closeCropper}
          onDone={(crop) => {
            onRecenter(cropping.key, crop);
            closeCropper();
          }}
        />
      ) : null}
    </>
  );
}

function Thumb({
  item,
  index,
  onRemove,
  onAlt,
  onCenter,
}: {
  item: PhotoItem;
  index: number;
  onRemove: () => void;
  onAlt: (alt: string) => void;
  onCenter: () => void;
}) {
  const sortable = useSortable({ id: item.key, disabled: item.status !== 'ready' });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };
  const [editingAlt, setEditingAlt] = useState(false);
  const busy = item.status === 'preparing' || item.status === 'uploading';

  if (item.status === 'error') {
    return (
      <li ref={sortable.setNodeRef} style={style} className="ph fail">
        <span>
          {t.photo.failed} · {item.error}
        </span>
        <span style={{ display: 'flex', gap: 6 }}>
          {item.retry ? (
            <button type="button" className="b" onClick={item.retry}>
              {t.photo.retry}
            </button>
          ) : null}
          <button type="button" className="b ghost dan" onClick={onRemove}>
            {t.photo.remove}
          </button>
        </span>
      </li>
    );
  }

  return (
    <li
      ref={sortable.setNodeRef}
      style={style}
      data-photo-id={item.id ?? undefined}
      data-version={item.version ?? undefined}
      data-crop={
        item.crop
          ? `${item.crop.x},${item.crop.y},${item.crop.width},${item.crop.height}`
          : undefined
      }
      className={cn('ph', sortable.isDragging && 'drag', editingAlt && 'editing', busy && 'busy')}
    >
      <div
        className="drag-area"
        {...sortable.attributes}
        {...(busy ? {} : sortable.listeners)}
        aria-label={`${t.photo.cover} ${index + 1}`}
      >
        {item.previewUrl ? (
          <img className="photo" src={item.previewUrl} alt={item.alt} draggable={false} />
        ) : (
          <span>{t.photo.preparing}</span>
        )}
      </div>
      {index === 0 && !busy ? <span className="cover">{t.photo.cover}</span> : null}
      {item.small && !busy ? (
        <span className="warn" title={t.photo.small}>
          {t.photo.smallBadge}
        </span>
      ) : null}
      {busy ? (
        <span
          className="prog"
          role="progressbar"
          aria-valuenow={Math.round(item.progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <i style={{ width: `${Math.max(8, item.progress * 100)}%` }} />
        </span>
      ) : (
        <>
          <span className="acts">
            <button
              type="button"
              title={t.photo.center}
              aria-label={t.photo.center}
              onClick={onCenter}
            >
              ⌖
            </button>
            <button
              type="button"
              title={t.photo.alt}
              aria-label={t.photo.alt}
              aria-pressed={editingAlt}
              onClick={() => setEditingAlt((v) => !v)}
            >
              Aa
            </button>
            <button
              type="button"
              title={t.photo.remove}
              aria-label={t.photo.remove}
              onClick={onRemove}
            >
              ✕
            </button>
          </span>
          <span className="alt">
            <input
              type="text"
              value={item.alt}
              maxLength={200}
              aria-label={t.photo.alt}
              placeholder={t.photo.alt}
              onChange={(e) => onAlt(e.target.value)}
            />
          </span>
        </>
      )}
    </li>
  );
}
