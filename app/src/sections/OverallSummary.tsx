import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface OverallSummaryProps {
  status: 'GREEN' | 'YELLOW' | 'RED';
  summary: string;
}

export function OverallSummary({ status, summary }: OverallSummaryProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const badgeConfig = {
    GREEN: { bg: 'var(--green-soft)', color: 'var(--green-text)', text: 'All Clear' },
    YELLOW: { bg: 'var(--amber-soft)', color: 'var(--amber-text)', text: 'Caution' },
    RED: { bg: 'var(--red-soft)', color: 'var(--red-text)', text: 'Blocked' },
  };

  const badge = badgeConfig[status];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (cardRef.current) cardRef.current.style.opacity = '1';
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: `var(--section-gap) var(--page-pad-x) 0`,
      }}
    >
      <div
        ref={cardRef}
        className="bg-card-surface"
        style={{
          borderRadius: 'var(--card-radius)',
          padding: 'var(--card-pad)',
          opacity: 0,
        }}
      >
        {/* Badge */}
        <span
          className="font-body font-semibold inline-block"
          aria-label={`Status: ${badge.text}`}
          style={{
            background: badge.bg,
            color: badge.color,
            fontSize: '0.75rem',
            lineHeight: 1,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '5px 12px',
            borderRadius: 'var(--badge-radius)',
          }}
        >
          {badge.text}
        </span>

        {/* Summary */}
        <p
          className="font-body mt-4"
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
          }}
        >
          {summary}
        </p>
      </div>
    </section>
  );
}
