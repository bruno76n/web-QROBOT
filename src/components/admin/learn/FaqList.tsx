/** «Preguntas» box of the learning editor: add, remove and reorder the questions with dnd-kit. */

/* eslint-disable react-hooks/refs -- dnd-kit's `useSortable` returns ref callbacks that the React Compiler lint flags wrongly */
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { cn } from '@/lib/cn';
import { es } from '@/i18n/es';
import type { LearnFormInput } from './form';
import { FieldError } from './fields';

const t = es.admin.learn.editor;

/**
 * The questions in the order the page shows them (the first is `#pregunta-1`). Each row has a grip
 * (pointer or keyboard), the question, the answer and «Quitar».
 */
export function FaqList() {
  const { control } = useFormContext<LearnFormInput>();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'faqs' });
  // Pointer drags start after 5 px so the text fields still take clicks; the keyboard can reorder too.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** Moves the dropped question to its new place. */
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = fields.findIndex((f) => f.id === active.id);
    const to = fields.findIndex((f) => f.id === over.id);
    if (from >= 0 && to >= 0) move(from, to);
  };

  return (
    <div className="box">
      <h2>{t.faqs}</h2>
      <p className="hint">{t.faqsHint}</p>
      {fields.length === 0 ? <p className="hint2">{t.faqNone}</p> : null}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <ol className="learn-faqs">
            {fields.map((f, i) => (
              <FaqRow key={f.id} id={f.id} index={i} onRemove={() => remove(i)} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <button type="button" className="b" onClick={() => append({ q: '', a: '' })}>
        {t.faqAdd}
      </button>
    </div>
  );
}

/** One sortable question: grip, question, answer and «Quitar». */
function FaqRow({ id, index, onRemove }: { id: string; index: number; onRemove: () => void }) {
  const { register, formState } = useFormContext<LearnFormInput>();
  const s = useSortable({ id });
  const n = index + 1;
  const errors = formState.errors.faqs?.[index];
  return (
    <li
      ref={s.setNodeRef}
      style={{ transform: CSS.Transform.toString(s.transform), transition: s.transition }}
      className={cn('learn-faq', s.isDragging && 'drag')}
    >
      <button
        type="button"
        className="grip"
        aria-label={t.faqGrip(n)}
        {...s.attributes}
        {...s.listeners}
      >
        ⋮⋮
      </button>
      <div className="learn-faq-body">
        <div className="f">
          <label htmlFor={`faq-q-${id}`}>{t.faqQ(n)}</label>
          <input
            className={cn('in', errors?.q && 'err')}
            id={`faq-q-${id}`}
            {...register(`faqs.${index}.q`)}
          />
          <FieldError name={`faqs.${index}.q`} />
        </div>
        <div className="f">
          <label htmlFor={`faq-a-${id}`}>{t.faqA(n)}</label>
          <textarea
            className={cn('in', errors?.a && 'err')}
            id={`faq-a-${id}`}
            rows={3}
            {...register(`faqs.${index}.a`)}
          />
          <FieldError name={`faqs.${index}.a`} />
        </div>
      </div>
      <button type="button" className="b ghost dan" aria-label={t.faqRemove(n)} onClick={onRemove}>
        {es.admin.photo.remove}
      </button>
    </li>
  );
}
