import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ConfidenceSourcesProps {
  confidence: number;
  generatedAt: string;
  sourceDataDate: string | null;
}

export function ConfidenceSources({ confidence, generatedAt, sourceDataDate }: ConfidenceSourcesProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const cards = sectionRef.current?.querySelectorAll('.confidence-card');
      cards?.forEach((c) => { (c as HTMLElement).style.opacity = '1'; });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.confidence-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        marginTop: 'var(--section-gap)',
        maxWidth: '1100px',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: `0 var(--page-pad-x)`,
      }}
    >
      <h2
        className="font-display font-semibold"
        style={{
          fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
        }}
      >
        Analysis Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div
          className="confidence-card bg-card-surface"
          style={{
            borderRadius: 'var(--card-radius)',
            padding: 'var(--card-pad)',
            opacity: 0,
          }}
        >
          <span
            className="font-body block"
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
            }}
          >
            Confidence
          </span>
          <span
            className="font-display font-bold block mt-1"
            style={{
              fontSize: '1.75rem',
              color: 'var(--text-primary)',
            }}
          >
            {Math.round(confidence * 100)}%
          </span>
        </div>

        <div
          className="confidence-card bg-card-surface"
          style={{
            borderRadius: 'var(--card-radius)',
            padding: 'var(--card-pad)',
            opacity: 0,
          }}
        >
          <span
            className="font-body block"
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
            }}
          >
            Analysis Run
          </span>
          <span
            className="font-display font-bold block mt-1"
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-primary)',
            }}
          >
            {new Date(generatedAt).toLocaleString('en-GB', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Berlin',
            })}
          </span>
        </div>

        <div
          className="confidence-card bg-card-surface"
          style={{
            borderRadius: 'var(--card-radius)',
            padding: 'var(--card-pad)',
            opacity: 0,
          }}
        >
          <span
            className="font-body block"
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
            }}
          >
            Source Pages
          </span>
          <span
            className="font-display font-bold block mt-1"
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-primary)',
            }}
          >
            {sourceDataDate ?? 'Unknown'}
          </span>
          <span
            className="font-body block mt-2"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
            }}
          >
            Latest date shown by the tracked Microsoft release-health pages
          </span>
        </div>

      </div>
    </section>
  );
}
