import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { VersionStatus } from '@/types/api';

gsap.registerPlugin(ScrollTrigger);

interface VersionGridProps {
  versions: VersionStatus[];
}

export function VersionGrid({ versions }: VersionGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const badgeConfig = {
    GREEN: { bg: 'var(--green-soft)', color: 'var(--green-text)', text: 'Clear' },
    YELLOW: { bg: 'var(--amber-soft)', color: 'var(--amber-text)', text: 'Caution' },
    RED: { bg: 'var(--red-soft)', color: 'var(--red-text)', text: 'Blocked' },
  };

  const borderConfig = {
    GREEN: 'var(--green)',
    YELLOW: 'var(--amber)',
    RED: 'var(--red)',
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const cards = gridRef.current?.querySelectorAll('.version-card');
      cards?.forEach((c) => { (c as HTMLElement).style.opacity = '1'; });
      return;
    }

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll('.version-card');
      if (!cards) return;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: gridRef.current,
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
        padding: `0 var(--page-pad-x)`,
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Section header */}
        <h2
          className="font-display font-semibold"
          style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
        >
          Per-Version Status
        </h2>
        <p
          className="font-body mt-2"
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}
        >
          Release health for each tracked Windows version
        </p>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid gap-4 mt-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          }}
        >
          {versions.map((version) => {
            const badge = badgeConfig[version.status];
            const borderColor = borderConfig[version.status];
            const patchText = version.should_block_patch ? 'Blocked' : 'Allowed';
            const patchColor = version.should_block_patch ? 'var(--red-text)' : 'var(--green-text)';

            return (
              <article
                key={version.version}
                className="version-card bg-card-surface"
                style={{
                  borderRadius: 'var(--card-radius)',
                  padding: 'var(--card-pad)',
                  borderLeftWidth: '3px',
                  borderLeftStyle: 'solid',
                  borderLeftColor: borderColor,
                  opacity: 0,
                }}
              >
                {/* Top: name + badge */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3
                    className="font-display font-semibold"
                    style={{
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {version.version}
                  </h3>
                  <span
                    className="font-body font-semibold inline-block"
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      fontSize: '0.6875rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '3px 10px',
                      borderRadius: 'var(--badge-radius)',
                    }}
                  >
                    {badge.text}
                  </span>
                </div>

                {/* Summary */}
                <p
                  className="font-body mt-3"
                  style={{
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {version.summary}
                </p>

                {/* Bottom: patch + date */}
                <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                  <span
                    className="font-body font-medium"
                    style={{
                      fontSize: '0.8125rem',
                      color: patchColor,
                    }}
                  >
                    Patch: {patchText}
                  </span>
                  <span
                    className="font-body"
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {version.data_date}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
