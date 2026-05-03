'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { type Control, Controller, useForm, useWatch } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { ChipMultiSelect } from './chip-multi-select';
import {
  HOURLY_RATE_DEFAULT,
  HOURLY_RATE_MAX,
  HOURLY_RATE_MIN,
  HOURLY_RATE_STEP,
  industries,
  type Lead,
  leadSchema,
  projectTypes,
  timelines,
} from './form-schema';
import { HourlyRateSlider } from './hourly-rate-slider';
import { TurnstileWidget } from './turnstile-widget';

// Qualified-inquiry form. Single-screen layout; all required fields visible
// at once so visitors can scan the commitment before they start typing.
//
// Submit pipeline (client side):
//   1. zod validation via @hookform/resolvers - synchronous, surfaces field
//      errors inline.
//   2. POST to /api/contact with JSON body matching Lead.
//   3. On 200: caller's onSuccess fires with {status} so the parent can
//      swap to the thank-you screen.
//   4. On 400/429/500: surfaces a contextual error message and re-enables
//      submit. We never auto-reset the Turnstile widget on success because
//      the form has been replaced by the thank-you screen at that point.

type FormStatus = 'qualified' | 'exploratory';

type Props = {
  onSuccess: (status: FormStatus) => void;
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function QualificationForm({ onSuccess }: Props) {
  const t = useTranslations('contactPage.form');
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Turnstile mounts only after the user starts interacting with the form
  // (first focus on any field). Mounting it eagerly blocks the main thread
  // for ~1-3 seconds on iPhone with the script load + Cloudflare's
  // background risk analysis, which queues the user's first tap and makes
  // it look like the keyboard "appears 3 seconds later". Deferring lets
  // the form become responsive instantly and gives Turnstile the entire
  // form-fill time (typically 30s+) to produce a token in the background.
  const [shouldMountTurnstile, setShouldMountTurnstile] = useState(false);

  // onFocusCapture on the form element fires for any descendant focus
  // (uses capture phase so it runs before the field's own focus handler).
  // useCallback so the handler ref is stable across renders.
  const onFirstFocus = useCallback(() => {
    setShouldMountTurnstile(true);
  }, []);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Lead>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      industry: undefined,
      projectTypes: [],
      hourlyRate: HOURLY_RATE_DEFAULT,
      timeline: undefined,
      description: '',
      turnstileToken: '',
    },
    mode: 'onBlur',
  });

  // Stable callback so the Turnstile widget's useEffect doesn't tear down
  // and recreate the challenge on every parent re-render (each keystroke in
  // the description textarea fires a re-render via watch()).
  const onToken = useCallback(
    (token: string) => {
      setValue('turnstileToken', token, { shouldValidate: !!token });
    },
    [setValue],
  );

  async function onSubmit(values: Lead) {
    setSubmitError(null);
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (r.status === 429) {
        setSubmitError(t('errorRateLimit'));
        return;
      }
      if (r.status === 400) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setSubmitError(j.error === 'turnstile-failed' ? t('errorTurnstile') : t('errorGeneric'));
        return;
      }
      if (!r.ok) {
        setSubmitError(t('errorGeneric'));
        return;
      }
      const j = (await r.json()) as { status: FormStatus };
      onSuccess(j.status);
    } catch {
      setSubmitError(t('errorGeneric'));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onFocusCapture={onFirstFocus}
      noValidate
      className="space-y-4 md:space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Field label={t('nameLabel')} error={errors.name && t('errorRequired')}>
          <input
            {...register('name')}
            type="text"
            autoComplete="name"
            placeholder={t('namePlaceholder')}
            className={inputClass(!!errors.name)}
          />
        </Field>
        <Field label={t('emailLabel')} error={errors.email && t('errorEmail')}>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            className={inputClass(!!errors.email)}
          />
        </Field>
        <Field label={t('companyLabel')} error={errors.company && t('errorRequired')}>
          <input
            {...register('company')}
            type="text"
            autoComplete="organization"
            placeholder={t('companyPlaceholder')}
            className={inputClass(!!errors.company)}
          />
        </Field>
        <Field label={t('industryLabel')} error={errors.industry && t('errorRequired')}>
          <select
            {...register('industry')}
            defaultValue=""
            className={cn(inputClass(!!errors.industry), 'appearance-none')}
          >
            <option value="" disabled>
              {t('industryPlaceholder')}
            </option>
            {industries.map((v) => (
              <option key={v} value={v}>
                {t(`industry.${v}`)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label={t('projectTypeLabel')}
        hint={t('projectTypeHint')}
        error={errors.projectTypes && t('errorRequired')}
      >
        <Controller
          control={control}
          name="projectTypes"
          render={({ field, fieldState }) => (
            <ChipMultiSelect
              options={projectTypes.map((v) => ({ value: v, label: t(`projectType.${v}`) }))}
              value={field.value ?? []}
              onChange={field.onChange}
              ariaLabel={t('projectTypeLabel')}
              hasError={!!fieldState.error}
            />
          )}
        />
      </Field>

      <Field label={t('hourlyRateLabel')} error={errors.hourlyRate && t('errorRequired')}>
        <Controller
          control={control}
          name="hourlyRate"
          render={({ field }) => (
            <HourlyRateSlider
              value={field.value ?? HOURLY_RATE_DEFAULT}
              onChange={field.onChange}
              min={HOURLY_RATE_MIN}
              max={HOURLY_RATE_MAX}
              step={HOURLY_RATE_STEP}
              ariaLabel={t('hourlyRateLabel')}
              suffix={t('hourlyRateSuffix')}
            />
          )}
        />
      </Field>

      <Field label={t('timelineLabel')} error={errors.timeline && t('errorRequired')}>
        <select
          {...register('timeline')}
          defaultValue=""
          className={cn(inputClass(!!errors.timeline), 'appearance-none')}
        >
          <option value="" disabled>
            {t('timelinePlaceholder')}
          </option>
          {timelines.map((v) => (
            <option key={v} value={v}>
              {t(`timeline.${v}`)}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label={t('descriptionLabel')}
        hint={<DescriptionHint control={control} template={(vars) => t('descriptionHint', vars)} />}
        error={
          errors.description?.type === 'too_small'
            ? t('errorMin')
            : errors.description?.type === 'too_big'
              ? t('errorMax')
              : errors.description
                ? t('errorRequired')
                : undefined
        }
      >
        <textarea
          {...register('description')}
          rows={4}
          placeholder={t('descriptionPlaceholder')}
          maxLength={2000}
          className={cn(inputClass(!!errors.description), 'resize-y min-h-[110px]')}
        />
      </Field>

      {shouldMountTurnstile && <TurnstileWidget siteKey={SITE_KEY} onToken={onToken} />}

      {submitError && (
        <div
          role="alert"
          className="rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
        >
          {submitError}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-border">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"
          />
          {t('replyTime')}
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold cursor-pointer whitespace-nowrap',
            'bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-lg shadow-brand-purple/20',
            'transition-[transform,opacity,box-shadow] duration-[var(--duration-short)]',
            'hover:opacity-90 hover:shadow-xl hover:shadow-brand-purple/30 active:scale-[0.98]',
            'disabled:cursor-wait disabled:opacity-60 disabled:hover:shadow-lg',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          )}
        >
          {isSubmitting ? t('submitting') : t('submit')}
          <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  // Implicit-labeling pattern: the input is a descendant of the <label>, so
  // it doesn't need an htmlFor/id pair to be associated. Valid per HTML spec
  // and supported by every assistive tech we care about; the lint warning is
  // a false positive for this pattern.
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: implicit labeling, control is the {children} input
    <label className="block">
      <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted mb-2">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-text-faint">{hint}</span>
      ) : null}
    </label>
  );
}

function inputClass(hasError: boolean): string {
  return cn(
    // text-base (16px) on mobile is required to prevent iOS Safari from
    // auto-zooming into the field on focus. iOS auto-zooms any input /
    // textarea / select with font-size < 16px and does NOT zoom back out
    // when the keyboard closes, leaving the user with fields wider than
    // the viewport and "anchored to the left" - a real iPhone 17 surfaced
    // this. md:text-sm keeps the elegant 14px on desktop where the
    // auto-zoom heuristic does not apply.
    'block w-full rounded-md bg-bg-elevated px-4 py-2.5 text-base md:text-sm text-text',
    'border placeholder:text-text-faint',
    'transition-[border-color,box-shadow] duration-[var(--duration-short)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40',
    hasError
      ? 'border-error/50 focus-visible:ring-error/30'
      : 'border-border hover:border-border-hover focus-visible:border-brand-blue/40',
  );
}

// Isolated re-render scope for the live character counter. Subscribing here
// via useWatch keeps every keystroke from re-rendering the entire
// QualificationForm (which previously did `watch('description')` at scope
// and re-rendered all 14 children per character on iOS Safari).
function DescriptionHint({
  control,
  template,
}: {
  control: Control<Lead>;
  template: (vars: { count: number }) => string;
}) {
  const description = useWatch({ control, name: 'description' }) ?? '';
  return <>{template({ count: description.length })}</>;
}
