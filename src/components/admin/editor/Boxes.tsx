import { Controller, useFormContext } from 'react-hook-form';
import { cn } from '@/lib/cn';
import { categories } from '@/config/categories';
import { colors } from '@/config/colors';
import { es } from '@/i18n/es';
import type { ProductFormValues } from '@/lib/product-form';

const t = es.admin.editor;

function FieldError({ name }: { name: keyof ProductFormValues }) {
  const { formState } = useFormContext<ProductFormValues>();
  const error = formState.errors[name];
  return error?.message ? (
    <small className="err-t" role="alert">
      {String(error.message)}
    </small>
  ) : null;
}

const Count = ({ value, max }: { value: string; max: number }) => (
  <span className="count">
    {value.length}/{max}
  </span>
);

/** A set of check-style chips: the order of the picks is kept (it is the display order). */
function Chips<T extends string>({
  name,
  options,
}: {
  name: 'categories' | 'colors';
  options: readonly { id: T; label: string; hex?: string }[];
}) {
  const { control } = useFormContext<ProductFormValues>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value as string[];
        return (
          <div className="chips" role="group">
            {options.map((o) => (
              <label className="chip" key={o.id}>
                <input
                  type="checkbox"
                  checked={value.includes(o.id)}
                  onChange={(e) =>
                    field.onChange(
                      e.target.checked ? [...value, o.id] : value.filter((v) => v !== o.id),
                    )
                  }
                />
                <span>
                  {o.hex ? <i style={{ ['--c' as string]: o.hex }} /> : null}
                  {o.label}
                </span>
              </label>
            ))}
          </div>
        );
      }}
    />
  );
}

export function BasicsBox({
  slugPreview,
  onSlugTouched,
  showSlugWarning,
}: {
  slugPreview: string;
  onSlugTouched: () => void;
  showSlugWarning: boolean;
}) {
  const { register, watch, formState } = useFormContext<ProductFormValues>();
  const slug = register('slug');
  return (
    <div className="box">
      <h2>{t.basics}</h2>
      <p className="hint">{t.basicsHint}</p>
      <div className="f">
        <label htmlFor="f-name">{t.name}</label>
        <input
          className={cn('in', formState.errors.name && 'err')}
          id="f-name"
          maxLength={80}
          placeholder={t.namePlaceholder}
          {...register('name')}
        />
        <FieldError name="name" />
      </div>
      <div className="f">
        <label htmlFor="f-slug">{t.slug}</label>
        <div className="url">
          <span>{t.slugPrefix}</span>
          <input
            className="in"
            id="f-slug"
            placeholder={t.slugPlaceholder}
            {...slug}
            value={watch('slug') || slugPreview}
            onChange={(e) => {
              onSlugTouched();
              void slug.onChange(e);
            }}
          />
        </div>
        {showSlugWarning ? <small>{t.slugWarning}</small> : null}
        <FieldError name="slug" />
      </div>
      <div className="f">
        <label htmlFor="f-short">{t.short}</label>
        <input
          className="in"
          id="f-short"
          maxLength={120}
          placeholder={t.shortPlaceholder}
          {...register('short')}
        />
        <Count value={watch('short')} max={120} />
        <FieldError name="short" />
      </div>
      <div className="grid2">
        <div className="f">
          <label htmlFor="f-price">{t.price}</label>
          <div className="money">
            <input
              className={cn('in', formState.errors.priceText && 'err')}
              id="f-price"
              inputMode="decimal"
              placeholder={t.pricePlaceholder}
              {...register('priceText')}
            />
          </div>
          <FieldError name="priceText" />
        </div>
        <div className="f">
          <label htmlFor="f-pnote">{t.priceNote}</label>
          <input
            className="in"
            id="f-pnote"
            maxLength={120}
            placeholder={t.priceNotePlaceholder}
            {...register('priceNote')}
          />
        </div>
      </div>
      <div className="f">
        <span id="cats-label">{t.categories}</span>
        <Chips name="categories" options={categories} />
      </div>
    </div>
  );
}

export function PageBox() {
  const { register, watch, formState } = useFormContext<ProductFormValues>();
  return (
    <div className="box">
      <h2>{t.pageSection}</h2>
      <p className="hint">{t.pageHint}</p>
      <div className="f">
        <label htmlFor="f-desc">{t.description}</label>
        <textarea
          className={cn('in', formState.errors.description && 'err')}
          id="f-desc"
          maxLength={2000}
          placeholder={t.descriptionPlaceholder}
          {...register('description')}
        />
        <Count value={watch('description')} max={2000} />
        <FieldError name="description" />
      </div>
      <div className="grid3">
        <div className="f">
          <label htmlFor="f-size">{t.size}</label>
          <input className="in" id="f-size" placeholder={t.sizePlaceholder} {...register('size')} />
        </div>
        <div className="f">
          <label htmlFor="f-mat">{t.material}</label>
          <input className="in" id="f-mat" placeholder="PLA" {...register('material')} />
        </div>
        <div className="f">
          <label htmlFor="f-lead">{t.leadTime}</label>
          <input
            className="in"
            id="f-lead"
            placeholder={t.leadTimePlaceholder}
            {...register('leadTime')}
          />
        </div>
      </div>
      <div className="f">
        <span>{t.colors}</span>
        <Chips name="colors" options={colors} />
        <small>{t.colorsHint}</small>
      </div>
      <div className="grid2">
        <div className="f">
          <label htmlFor="f-u1">{t.unitOne}</label>
          <input className="in" id="f-u1" placeholder="llavero" {...register('unitSingular')} />
        </div>
        <div className="f">
          <label htmlFor="f-u2">{t.unitMany}</label>
          <input className="in" id="f-u2" placeholder="llaveros" {...register('unitPlural')} />
        </div>
      </div>
      <small style={{ display: 'block', marginTop: -6, fontSize: 12, color: 'var(--ink-3)' }}>
        {t.unitHint}
      </small>
    </div>
  );
}

function Switch({
  name,
  label,
  hint,
  disabled,
}: {
  name: 'personalizable' | 'featured' | 'published';
  label: string;
  hint: string;
  disabled?: boolean;
}) {
  const { register } = useFormContext<ProductFormValues>();
  return (
    <div className="sw">
      <div>
        <b>{label}</b>
        <small>{hint}</small>
      </div>
      <span className="tg">
        <input type="checkbox" aria-label={label} disabled={disabled} {...register(name)} />
        <i />
      </span>
    </div>
  );
}

export function OptionsBox() {
  const { register, watch } = useFormContext<ProductFormValues>();
  const personalizable = watch('personalizable');
  return (
    <div className="box">
      <Switch name="personalizable" label={t.personalizable} hint={t.personalizableHint} />
      {personalizable ? (
        <div className="f" style={{ marginTop: 6 }}>
          <label htmlFor="f-phint">{t.personalHint}</label>
          <input
            className="in"
            id="f-phint"
            maxLength={60}
            placeholder={t.personalHintPlaceholder}
            {...register('personalHint')}
          />
        </div>
      ) : null}
      <Switch name="featured" label={t.featured} hint={t.featuredHint} />
      <Switch
        name="published"
        label={t.published}
        hint={t.publishedHint}
      />
    </div>
  );
}
