import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (footerRef.current) footerRef.current.style.opacity = '1';
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 95%',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="text-center"
      style={{
        padding: '3rem var(--page-pad-x)',
        borderTop: '1px solid var(--border-light)',
        opacity: 0,
      }}
    >
      {/* Disclaimer */}
      <div
        className="mx-auto"
        style={{ maxWidth: '640px' }}
      >
        <p
          className="font-body"
          style={{
            fontSize: '0.75rem',
            lineHeight: 1.7,
            color: 'var(--text-muted)',
          }}
        >
          <strong style={{ color: 'var(--text-secondary)' }}>Disclaimer:</strong> This service is provided for informational purposes only. The data is sourced from Microsoft release-health and processed using AI models. While we strive for accuracy, we make no guarantees about the completeness or timeliness of this information. By using this service, you acknowledge that we are not responsible for any damages, losses, or issues arising from decisions made based on this data. Always verify patch readiness through official Microsoft channels before deploying updates in production environments.
        </p>
      </div>

      {/* Separator */}
      <div
        className="mx-auto"
        style={{
          maxWidth: '120px',
          height: '1px',
          background: 'var(--border-light)',
          margin: '1.5rem auto',
        }}
      />

      {/* Branding */}
      <p
        className="font-body"
        style={{
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          color: 'var(--text-muted)',
        }}
      >
        is-windows-broken.com &mdash; independent Windows patch readiness checker
      </p>
      <p
        className="font-body mt-1"
        style={{
          fontSize: '0.75rem',
          lineHeight: 1.6,
          color: 'var(--text-muted)',
        }}
      >
        Data sourced from Microsoft release-health. Not affiliated with Microsoft.
      </p>
    </footer>
  );
}
