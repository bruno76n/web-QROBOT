import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ProductDetail } from '@/lib/admin-types';
import { parsePesos } from '@/lib/money';
import {
  emptyValues,
  productFormSchema,
  toProductInput,
  valuesFromDetail,
  type ProductFormValues,
} from '@/lib/product-form';
import { missingToPublish, slugFromName } from '@/lib/publish';
import { es } from '@/i18n/es';
import { useConfirm } from './ConfirmDialog';
import { BasicsBox, OptionsBox, PageBox } from './editor/Boxes';
import { PhotoUploader } from './photos/PhotoUploader';
import { fingerprint, itemFromView, refsOf, usePhotos } from './photos/usePhotos';
import { api } from './lib/api';
import { errorText, missingList } from './lib/error-text';
import { setDirty } from './lib/dirty';
import { keys } from './lib/queries';

const t = es.admin;
const photoItems = (d: ProductDetail | null) =>
  d?.photos.map((p) => itemFromView(p, 'product')) ?? [];

interface Props {
  detail: ProductDetail | null;
  onSelect: (id: string | null) => void;
  onSaved: (id: string) => void;
}

/** The product editor (docs/12 §2): photos, basics, page, options and the save bar. */
export function EditorForm({ detail, onSelect, onSaved }: Props) {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: detail ? valuesFromDetail(detail) : emptyValues(),
  });
  const photos = usePhotos(photoItems(detail), 'product', 10);
  const [baseline, setBaseline] = useState(() => fingerprint(photoItems(detail)));
  const [saving, setSaving] = useState(false);

  // react-hook-form's `watch` is not memoizable by the React Compiler; the form is small.
  // eslint-disable-next-line react-hooks/incompatible-library
  const values = form.watch();
  const photosChanged = fingerprint(photos.photos) !== baseline;
  const dirty = form.formState.isDirty || photosChanged;
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty]);

  // The address is never typed: it follows the name (docs/09 §3). Only used here to know
  // whether the product could be published.
  const slugPreview = slugFromName(values.name) || detail?.slug || '';

  const missing = useMemo(
    () =>
      missingToPublish({
        name: values.name,
        slug: slugPreview || 'x',
        photoCount: refsOf(photos.photos).length,
        categoryCount: values.categories.length,
        priceFromCents: parsePesos(values.priceText),
      }),
    [values.name, values.categories.length, values.priceText, slugPreview, photos.photos],
  );

  const reload = async (id: string) => {
    const res = await api.getProduct(id);
    if (!res.ok) return;
    qc.setQueryData(keys.product(id), res.data);
    form.reset(valuesFromDetail(res.data));
    photos.setPhotos(photoItems(res.data));
    setBaseline(fingerprint(photoItems(res.data)));
  };

  const onSubmit = form.handleSubmit(async (v) => {
    if (photos.busy) return void toast.error(t.actions.waitUploads);
    setSaving(true);
    const input = toProductInput({ ...v, slug: '' }, refsOf(photos.photos), detail?.id);
    const res = await api.saveProduct(input);
    setSaving(false);
    if (res.ok) {
      toast.success(t.actions.saved);
      void qc.invalidateQueries({ queryKey: keys.products });
      if (detail) await reload(res.data.id);
      else {
        setDirty(false);
        onSaved(res.data.id);
      }
      return;
    }
    if (res.code === 'CANNOT_PUBLISH') form.setValue('published', false, { shouldDirty: true });
    if (res.code === 'VALIDATION') {
      const fields = (res.details?.fields ?? {}) as Record<string, string[]>;
      for (const name of Object.keys(fields)) {
        if (name in v)
          form.setError(name as keyof ProductFormValues, {
            message: fields[name]?.[0] ?? t.errors.VALIDATION,
          });
      }
    }
    toast.error(errorText(res));
  });

  const duplicate = async () => {
    if (!detail) return;
    const res = await api.duplicateProduct(detail.id);
    if (!res.ok) return void toast.error(errorText(res));
    toast.success(t.actions.duplicated);
    void qc.invalidateQueries({ queryKey: keys.products });
    onSelect(res.data.id);
  };

  const remove = async () => {
    if (!detail) return;
    const yes = await confirm({
      title: t.actions.deleteTitle,
      text: t.actions.deleteText,
      yes: t.actions.deleteYes,
      no: t.actions.deleteNo,
      danger: true,
    });
    if (!yes) return;
    const res = await api.deleteProduct(detail.id);
    if (!res.ok) return void toast.error(errorText(res));
    toast.success(t.actions.deleted);
    void qc.invalidateQueries({ queryKey: keys.products });
    setDirty(false);
    onSelect(null);
  };

  const title = values.name.trim() || (detail ? detail.name : t.editor.newTitle);
  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => void onSubmit(e)} noValidate>
        <div className="ed">
          <div className="ed-h">
            <button
              type="button"
              className="b ghost back"
              aria-label={t.editor.back}
              onClick={() => onSelect(null)}
            >
              ←
            </button>
            <h1>{title}</h1>
            {dirty ? <span className="dirty">{t.unsaved}</span> : null}
          </div>

          <div className="box">
            <h2>{t.editor.photos}</h2>
            <p className="hint">{t.editor.photosHint}</p>
            <PhotoUploader
              photos={photos.photos}
              usage="product"
              max={10}
              onAdd={photos.addFiles}
              onRemove={photos.remove}
              onAlt={photos.setAlt}
              onMove={photos.move}
              onRecenter={(key, crop) => void photos.recenter(key, crop)}
            />
          </div>

          <BasicsBox />
          <PageBox />
          <OptionsBox
            missingText={missing.length > 0 ? missingList(missing) : null}
            canPublish={missing.length === 0}
          />
        </div>

        <div className="save">
          <button type="submit" className="b pri" disabled={saving}>
            {saving ? t.actions.saving : t.actions.save}
          </button>
          {detail?.published ? (
            <a className="b" href={`/producto/${detail.slug}`} target="_blank" rel="noopener">
              {t.actions.viewPage}
            </a>
          ) : null}
          <span className="sp" />
          {detail ? (
            <>
              <button type="button" className="b ghost" onClick={() => void duplicate()}>
                {t.actions.duplicate}
              </button>
              <button type="button" className="b ghost dan" onClick={() => void remove()}>
                {t.actions.delete}
              </button>
            </>
          ) : null}
        </div>
      </form>
    </FormProvider>
  );
}
