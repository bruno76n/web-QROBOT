/** The learning page editor form: fixed facts, basics, body with preview, questions, lists, call and the save bar. */

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { learnTopicName } from '@/config/learn';
import { learnCtas } from '@/lib/learn/content';
import { es } from '@/i18n/es';
import { errorText } from '../lib/error-text';
import { setDirty } from '../lib/dirty';
import {
  learnApi,
  learnKeys,
  learnPageUrl,
  useLearnPages,
  useSetLearnPublished,
  type LearnDetail,
} from './api';
import { FaqList } from './FaqList';
import { Count, FieldError, PickList, TagInput } from './fields';
import {
  learnFormError,
  learnFormSchema,
  toLearnInput,
  valuesFromPage,
  type LearnFormInput,
  type LearnFormValues,
} from './form';

/** The preview pulls in the Markdown parser, so it loads only when the person opens it. */
const LearnPreview = lazy(() => import('./LearnPreview'));

const t = es.admin.learn.editor;

/** `detail` is the page as saved; `onBack` returns to the list (phones). */
interface Props {
  detail: LearnDetail;
  onBack: () => void;
}

/**
 * Edits one page (docs/12 §5c). Values live in react-hook-form, validated with the server schema;
 * changes mark the panel as having unsaved changes. «Publicada» is the quick switch: it saves at
 * once on its own, apart from «Guardar».
 */
export function LearnForm({ detail, onBack }: Props) {
  const qc = useQueryClient();
  const pages = useLearnPages().data;
  const setPublished = useSetLearnPublished();
  const form = useForm<LearnFormInput, unknown, LearnFormValues>({
    resolver: zodResolver(learnFormSchema, { error: learnFormError }),
    defaultValues: valuesFromPage(detail),
  });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  const dirty = form.formState.isDirty;
  // Publishes the unsaved-changes flag for the tabs and the list; clears it when the editor closes.
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty]);

  // react-hook-form's `watch` is not memoizable by the React Compiler; the form is small.
  // eslint-disable-next-line react-hooks/incompatible-library
  const values = form.watch();

  /** Pages that can be related: every other page, named by title and topic. */
  const relatedOptions = useMemo(
    () =>
      (pages ?? [])
        .filter((p) => p.id !== detail.id)
        .map((p) => ({
          value: p.slug,
          label: `${p.title} · ${p.topic ? learnTopicName(p.topic) : t.homeTopic}`,
        })),
    [pages, detail.id],
  );
  const sourceOptions = useMemo(
    () => detail.sourceOptions.map((s) => ({ value: s.id, label: s.name })),
    [detail.sourceOptions],
  );

  /** Re-reads the saved page and resets the form to it. */
  const reload = async () => {
    const res = await learnApi.get(detail.id);
    if (!res.ok) return;
    qc.setQueryData(learnKeys.page(detail.id), res.data);
    form.reset(valuesFromPage(res.data));
  };

  /**
   * Saves the page with its current published state. On success the list is refreshed and the
   * form reloads; a search index that did not follow is a warning. Rejections name the field they
   * belong to: related pages, a block mark in the body, or the fields Zod rejected.
   */
  const onSubmit = form.handleSubmit(async (v) => {
    setSaving(true);
    const res = await learnApi.save(toLearnInput(v, detail.id, detail.published));
    setSaving(false);
    if (res.ok) {
      toast.success(t.saved);
      if (res.data.search === 'failed') toast.warning(es.admin.errors.SEARCH_NOT_UPDATED);
      void qc.invalidateQueries({ queryKey: learnKeys.pages });
      await reload();
      return;
    }
    const message = errorText(res);
    if (res.code === 'UNKNOWN_RELATED') form.setError('related', { message });
    if (res.code === 'UNKNOWN_BLOCK') {
      form.setError('bodyMd', { message });
      setMode('write');
    }
    if (res.code === 'VALIDATION') {
      const fields = (res.details?.fields ?? {}) as Record<string, string[]>;
      for (const name of Object.keys(fields))
        if (name in v)
          form.setError(name as keyof LearnFormValues, {
            message: es.admin.errors.VALIDATION,
          });
    }
    toast.error(message);
  });

  /** The quick switch: shows or hides the page at once (it does not save the other fields). */
  const togglePublished = async (next: boolean) => {
    setToggling(true);
    await setPublished(detail.id, next);
    setToggling(false);
  };

  const topic = detail.topic ? learnTopicName(detail.topic) : t.homeTopic;
  const url = learnPageUrl(detail.slug);
  const title = values.title.trim() || detail.title;
  const { errors } = form.formState;
  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => void onSubmit(e)} noValidate>
        <div className="ed">
          <div className="ed-h">
            <button type="button" className="b ghost back" aria-label={t.back} onClick={onBack}>
              ←
            </button>
            <h1>{title}</h1>
            {dirty ? <span className="dirty">{es.admin.unsaved}</span> : null}
          </div>

          <dl className="learn-facts">
            <div>
              <dt>{t.address}</dt>
              <dd>
                <code>{url}</code>
              </dd>
            </div>
            <div>
              <dt>{t.topicLabel}</dt>
              <dd>{topic}</dd>
            </div>
            <div>
              <dt>{t.kindLabel}</dt>
              <dd>{t.kinds[detail.kind]}</dd>
            </div>
          </dl>
          <p className="learn-facts-hint">{t.fixedHint}</p>

          <div className="box">
            <div className="sw">
              <div>
                <b id="learn-pub-label">{t.published}</b>
                <small>{t.publishedHint}</small>
              </div>
              <span className="tg">
                <input
                  type="checkbox"
                  aria-labelledby="learn-pub-label"
                  checked={detail.published}
                  disabled={toggling}
                  onChange={(e) => void togglePublished(e.target.checked)}
                />
                <i />
              </span>
            </div>
          </div>

          <div className="box">
            <h2>{t.basics}</h2>
            <p className="hint">{t.basicsHint}</p>
            <div className="f">
              <label htmlFor="learn-title">{t.title}</label>
              <input
                className={cn('in', errors.title && 'err')}
                id="learn-title"
                maxLength={120}
                {...form.register('title')}
              />
              <FieldError name="title" />
            </div>
            <div className="f">
              <label htmlFor="learn-subtitle">{t.subtitle}</label>
              <input
                className={cn('in', errors.subtitle && 'err')}
                id="learn-subtitle"
                maxLength={300}
                {...form.register('subtitle')}
              />
              <Count value={values.subtitle} max={300} />
              <FieldError name="subtitle" />
            </div>
            <div className="f">
              <label htmlFor="learn-summary">{t.summary}</label>
              <textarea
                className={cn('in', errors.summary && 'err')}
                id="learn-summary"
                maxLength={500}
                rows={3}
                {...form.register('summary')}
              />
              <small>{t.summaryHint}</small>
              <Count value={values.summary} max={500} />
              <FieldError name="summary" />
            </div>
          </div>

          <div className="box">
            <div className="learn-body-h">
              <h2>{t.body}</h2>
              <div className="seg" role="group" aria-label={t.bodyModes}>
                <button
                  type="button"
                  aria-pressed={mode === 'write'}
                  onClick={() => setMode('write')}
                >
                  {t.write}
                </button>
                <button
                  type="button"
                  aria-pressed={mode === 'preview'}
                  onClick={() => setMode('preview')}
                >
                  {t.preview}
                </button>
              </div>
            </div>
            <p className="hint">{t.bodyHint}</p>
            <div className="f" hidden={mode !== 'write'}>
              <label className="vh" htmlFor="learn-body">
                {t.body}
              </label>
              <textarea
                className={cn('in learn-md', errors.bodyMd && 'err')}
                id="learn-body"
                spellCheck
                {...form.register('bodyMd')}
              />
              <FieldError name="bodyMd" />
            </div>
            {mode === 'preview' ? (
              <Suspense fallback={<div className="sk" style={{ height: 160 }} />}>
                <LearnPreview markdown={values.bodyMd} />
              </Suspense>
            ) : null}
          </div>

          <FaqList />

          <div className="box">
            <h2>{t.links}</h2>
            <div className="f">
              <label htmlFor="learn-tags">{t.tags}</label>
              <small>{t.tagsHint}</small>
              <Controller
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <TagInput id="learn-tags" value={field.value} onChange={field.onChange} />
                )}
              />
              <FieldError name="tags" />
            </div>
            <div className="f">
              <label htmlFor="learn-related">{t.related}</label>
              <small>{t.relatedHint}</small>
              <Controller
                control={form.control}
                name="related"
                render={({ field }) => (
                  <PickList
                    id="learn-related"
                    value={field.value}
                    options={relatedOptions}
                    addLabel={t.relatedAdd}
                    missing={pages ? t.relatedMissing : undefined}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError name="related" />
            </div>
            <div className="f">
              <label htmlFor="learn-sources">{t.sources}</label>
              <small>{t.sourcesHint}</small>
              <Controller
                control={form.control}
                name="sources"
                render={({ field }) => (
                  <PickList
                    id="learn-sources"
                    value={field.value}
                    options={sourceOptions}
                    addLabel={t.sourceAdd}
                    missing={t.relatedMissing}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError name="sources" />
            </div>
          </div>

          <div className="box">
            <h2>{t.cta}</h2>
            <p className="hint">{t.ctaHint}</p>
            <div className="grid2">
              <div className="f">
                <label htmlFor="learn-cta">{t.ctaKind}</label>
                <select className="in" id="learn-cta" {...form.register('cta')}>
                  {learnCtas.map((c) => (
                    <option key={c} value={c}>
                      {t.ctaKinds[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="f">
                <label htmlFor="learn-cta-text">{t.ctaText}</label>
                <input
                  className={cn('in', errors.ctaText && 'err')}
                  id="learn-cta-text"
                  maxLength={200}
                  {...form.register('ctaText')}
                />
                <small>{t.ctaTextHint}</small>
                <FieldError name="ctaText" />
              </div>
            </div>
          </div>
        </div>

        <div className="save">
          <button type="submit" className="b pri" disabled={saving}>
            {saving ? t.saving : t.save}
          </button>
          {detail.published ? (
            <a className="b" href={url} target="_blank" rel="noopener">
              {t.viewPage}
            </a>
          ) : null}
        </div>
      </form>
    </FormProvider>
  );
}
