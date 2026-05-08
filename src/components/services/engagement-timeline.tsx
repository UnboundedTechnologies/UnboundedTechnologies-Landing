'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { BRAND_HEX, type SolidAccent } from '@/lib/accents';
import { useIsTouch } from '@/lib/hooks/use-is-touch';
import { cn } from '@/lib/utils';

// Engagement-timeline interactive walkthrough.
//
// Hovering or focusing a step lights it up and grows the aurora fill bar
// from the start of the row to that step's position. The fill never auto-
// advances on its own; it only moves when the user explicitly hovers /
// focuses the next node. Leaving the timeline entirely fades the fill
// back to idle.
//
// Layers (decoration is aria-hidden):
//   1. Static base connector line (the thin grey gradient).
//   2. Animated aurora fill bar: width = (activeStep - 1) / 5, transitioned
//      via CSS over STEP_DURATION with a strong ease-in-out so the fill
//      eases into each step.
//   3. Glowing head at the leading edge of the fill, tinted to the current
//      step's brand color, follows the fill via the same transition.
//   4. Step circles: idle / active / visited states. Active circle scales
//      up, gains a brand-color border + glow, and runs two staggered
//      ping ripples (engagement-step-ping in globals.css).
//   5. Title text accents to the active step's brand color.
//   6. Body text brightens from text-text-muted to text-text when active.
//
// Accessibility: each li has tabIndex=0, onFocus mirrors onMouseEnter, and
// prefers-reduced-motion disables the chain (hover/focus still highlights
// the single step).

type Step = {
  titleKey: string;
  bodyKey: string;
  accent: SolidAccent;
};

const STEPS: ReadonlyArray<Step> = [
  { titleKey: 'step1Title', bodyKey: 'step1Body', accent: 'blue' },
  { titleKey: 'step2Title', bodyKey: 'step2Body', accent: 'purple' },
  { titleKey: 'step3Title', bodyKey: 'step3Body', accent: 'cyan' },
  { titleKey: 'step4Title', bodyKey: 'step4Body', accent: 'blue' },
  { titleKey: 'step5Title', bodyKey: 'step5Body', accent: 'purple' },
  { titleKey: 'step6Title', bodyKey: 'step6Body', accent: 'cyan' },
];

const TOTAL_STEPS = STEPS.length;
// Duration of the fill-bar transition when the user moves between nodes.
// Used by the CSS `transition` property on the fill width and head position.
const FILL_TRANSITION_MS = 1100;

// In a 6-column grid, the column centers sit at (k - 0.5) / 6 of the row
// width for k = 1..6. Step 1 -> 8.333 %, step 6 -> 91.667 %.
// The connector spans between those two centers.
const CONNECTOR_LEFT = 8.334;
const CONNECTOR_SPAN = 83.332;

export function EngagementTimeline() {
  const t = useTranslations('servicesPage');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isTouch = useIsTouch();
  const olRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Mobile auto-cascade: when the timeline scrolls into view on a touch
  // device, light up each step in sequence so mobile users see the same
  // animation desktop users get from hover. Triggers once.
  useEffect(() => {
    if (!isTouch || reducedMotion) return;
    const el = olRef.current;
    if (!el) return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          obs.disconnect();
          // Walk through 1 -> TOTAL_STEPS with a steady cadence. Each
          // step lights up for FILL_TRANSITION_MS / 1.6 ms before the
          // next one starts so the aurora fill bar has time to draw.
          const stepDelay = Math.round(FILL_TRANSITION_MS / 1.6);
          for (let i = 1; i <= TOTAL_STEPS; i++) {
            timeouts.push(
              setTimeout(() => {
                setActiveStep(i);
              }, i * stepDelay),
            );
          }
          return;
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => {
      for (const id of timeouts) clearTimeout(id);
      obs.disconnect();
    };
  }, [isTouch, reducedMotion]);

  const fillRatio = activeStep === 0 ? 0 : (activeStep - 1) / (TOTAL_STEPS - 1);
  const fillWidth = CONNECTOR_SPAN * fillRatio;
  const headAccent = activeStep > 0 ? STEPS[activeStep - 1].accent : 'blue';
  const headHex = BRAND_HEX[headAccent];

  return (
    <ol
      ref={olRef}
      className="grid grid-cols-1 md:grid-cols-6 gap-10 md:gap-4 relative"
      // Mouse-leave only resets on desktop. On mobile we want the auto-
      // cascade's final state to stick so the user sees the lit-up trail.
      onMouseLeave={isTouch ? undefined : () => setActiveStep(0)}
    >
      {/* 1. Static base connector */}
      <div
        aria-hidden
        className="hidden md:block absolute top-5 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        style={{ left: `${CONNECTOR_LEFT}%`, right: `${CONNECTOR_LEFT}%` }}
      />

      {/* 2. Animated aurora fill bar */}
      <div
        aria-hidden
        className="hidden md:block absolute top-5 h-[2px] -translate-y-[0.5px] pointer-events-none"
        style={{
          left: `${CONNECTOR_LEFT}%`,
          width: `${fillWidth}%`,
          background: 'linear-gradient(to right, #5d6fff, #a35dff, #5dc7ff)',
          boxShadow: activeStep > 0 ? `0 0 8px ${headHex}cc` : undefined,
          opacity: activeStep > 0 ? 1 : 0,
          transition: `width ${FILL_TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1), opacity 400ms ease-out, box-shadow 400ms ease-out`,
        }}
      />

      {/* 3. Glowing head at the leading edge of the fill */}
      {activeStep > 0 && !reducedMotion && (
        <div
          aria-hidden
          className="hidden md:block absolute top-5 -translate-y-1/2 pointer-events-none"
          style={{
            left: `calc(${CONNECTOR_LEFT}% + ${fillWidth}% - 12px)`,
            width: '24px',
            height: '24px',
            background: `radial-gradient(circle, ${headHex} 0%, transparent 65%)`,
            opacity: 0.85,
            filter: 'blur(2px)',
            transition: `left ${FILL_TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
          }}
        />
      )}

      {STEPS.map((step, idx) => {
        const num = idx + 1;
        const isActive = activeStep === num;
        const isVisited = activeStep > num;
        const accentHex = BRAND_HEX[step.accent];

        return (
          <li
            key={step.titleKey}
            className="relative flex flex-col items-start md:items-center"
            onMouseEnter={() => setActiveStep(num)}
            onFocus={() => setActiveStep(num)}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: focusable region for keyboard hover cascade; no click action, contains heading + body so cannot be a button
            tabIndex={0}
          >
            {/* 4. Number circle */}
            <div
              className={cn(
                'relative z-10 flex size-10 items-center justify-center rounded-full',
                'border bg-bg-elevated font-mono text-xs tracking-widest',
                'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                isActive && 'scale-[1.18]',
              )}
              style={{
                borderColor: isActive || isVisited ? accentHex : undefined,
                boxShadow: isActive
                  ? `0 0 32px ${accentHex}99, 0 0 14px ${accentHex}, inset 0 0 16px ${accentHex}33`
                  : isVisited
                    ? `0 0 8px ${accentHex}55`
                    : undefined,
                color: isActive ? '#ffffff' : isVisited ? accentHex : undefined,
              }}
            >
              {String(num).padStart(2, '0')}

              {/* Two staggered ping ripples on the active circle */}
              {isActive && !reducedMotion && (
                <>
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full engagement-step-ping"
                    style={{
                      border: `1.5px solid ${accentHex}`,
                      animation:
                        'engagement-step-ping 1500ms cubic-bezier(0.16, 1, 0.3, 1) infinite',
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full engagement-step-ping"
                    style={{
                      border: `1.5px solid ${accentHex}`,
                      animation:
                        'engagement-step-ping 1500ms cubic-bezier(0.16, 1, 0.3, 1) infinite 750ms',
                    }}
                  />
                </>
              )}
            </div>

            {/* 5. Title */}
            <h3
              className="mt-4 md:text-center text-sm md:text-base font-semibold leading-snug transition-colors duration-500"
              style={{ color: isActive ? accentHex : undefined }}
            >
              {t(step.titleKey)}
            </h3>

            {/* 6. Body */}
            <p
              className={cn(
                'mt-2 md:text-center text-xs md:text-sm leading-relaxed max-w-[16rem]',
                'transition-colors duration-500',
                isActive ? 'text-text' : 'text-text-muted',
              )}
            >
              {t(step.bodyKey)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
