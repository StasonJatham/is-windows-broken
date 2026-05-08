import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HeroVerdictProps {
  shouldBlockPatch: boolean;
  dataDate: string;
  isLoading: boolean;
  isUnavailable?: boolean;
}

export function HeroVerdict({ shouldBlockPatch, dataDate, isLoading, isUnavailable = false }: HeroVerdictProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const dateRef = useRef<HTMLParagraphElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // YES = safe to patch (green), NO = don't patch (red)
  const verdictWord = isUnavailable ? 'N/A' : shouldBlockPatch ? 'NO' : 'YES';
  const subtitle = isUnavailable
    ? 'Public patch data could not be loaded'
    : shouldBlockPatch
    ? 'Known issues detected \u2014 hold off on patching'
    : 'All clear \u2014 safe to patch';
  const glowClass = isUnavailable ? 'verdict-glow-amber' : shouldBlockPatch ? 'verdict-glow-red' : 'verdict-glow-green';
  const verdictColor = isUnavailable ? 'var(--amber-text)' : shouldBlockPatch ? 'var(--red-text)' : 'var(--green-text)';

  const formattedDate = new Date(dataDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    if (isLoading) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (glowRef.current) glowRef.current.style.opacity = '1';
      if (wordRef.current) wordRef.current.style.opacity = '1';
      if (subtitleRef.current) subtitleRef.current.style.opacity = '1';
      if (dateRef.current) dateRef.current.style.opacity = '1';
      if (scrollHintRef.current) scrollHintRef.current.style.opacity = '1';
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        glowRef.current,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.5)' }
      );

      if (wordRef.current) {
        const letters = wordRef.current.querySelectorAll('.verdict-letter');
        tl.fromTo(
          letters,
          { opacity: 0, yPercent: 50 },
          { opacity: 1, yPercent: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' },
          '-=0.6'
        );
      }

      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.2'
      );

      tl.fromTo(
        dateRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      );

      tl.fromTo(
        scrollHintRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        '-=0.2'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading, shouldBlockPatch, dataDate, verdictWord]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center"
      style={{ padding: '0 var(--page-pad-x)' }}
    >
      {/* Glow behind verdict */}
      <div
        ref={glowRef}
        className={`absolute pointer-events-none ${glowClass}`}
        style={{
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          opacity: 0,
          zIndex: 0,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Verdict word */}
      <h1
        ref={wordRef}
        role="status"
        aria-live="polite"
        aria-label={
          isUnavailable
            ? 'Verdict unavailable'
            : `Verdict: ${shouldBlockPatch ? 'No, do not patch' : 'Yes, safe to patch'}`
        }
        className="font-display font-bold relative z-10"
        style={{
          fontSize: 'clamp(7rem, 20vw, 16rem)',
          lineHeight: 0.85,
          letterSpacing: '-0.04em',
          color: verdictColor,
        }}
      >
        {isLoading ? (
          <span style={{ color: 'var(--text-muted)' }} className="animate-pulse-dots">
            {'\u00B7\u00B7\u00B7'}
          </span>
        ) : (
          verdictWord.split('').map((letter, i) => (
            <span key={i} className="verdict-letter inline-block" style={{ opacity: 0 }}>
              {letter}
            </span>
          ))
        )}
      </h1>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        className="font-body relative z-10 mt-5 text-center"
        style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          lineHeight: 1.5,
          color: 'var(--text-secondary)',
          opacity: 0,
          maxWidth: '480px',
        }}
      >
        {isLoading ? 'Checking Windows release-health data...' : subtitle}
      </p>

      {/* Date: "as of DATE" in small text */}
      {!isLoading && (
        <p
          ref={dateRef}
          className="font-body relative z-10 mt-3"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            opacity: 0,
          }}
        >
          analysis run on {formattedDate}
        </p>
      )}

      {/* Scroll hint */}
      <div
        ref={scrollHintRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        style={{ opacity: 0 }}
      >
        <span
          className="font-body hidden sm:block"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
          }}
        >
          Scroll for details
        </span>
        <svg
          className="animate-chevron-bob"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
