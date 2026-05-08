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

      <div
        className="font-body mt-4 flex items-center justify-center gap-4 flex-wrap"
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span>
          Built with <span aria-hidden="true">❤️</span> by Karl
        </span>
        <a
          href="https://karl.fail"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2"
          style={{ color: 'var(--accent-blue)' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6.5 2.5H13.5V9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 3L7 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.5 6.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          karl.fail
        </a>
        <a
          href="https://github.com/StasonJatham/is-windows-broken"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2"
          style={{ color: 'var(--accent-blue)' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M8 1.5C4.41 1.5 1.5 4.48 1.5 8.16C1.5 11.1 3.36 13.59 5.94 14.47C6.26 14.53 6.38 14.33 6.38 14.16V13.06C4.57 13.47 4.19 12.27 4.19 12.27C3.89 11.5 3.46 11.29 3.46 11.29C2.87 10.88 3.5 10.89 3.5 10.89C4.16 10.94 4.5 11.59 4.5 11.59C5.08 12.6 6.03 12.31 6.4 12.14C6.46 11.71 6.63 11.42 6.82 11.25C5.37 11.08 3.84 10.5 3.84 7.92C3.84 7.19 4.09 6.6 4.51 6.14C4.44 5.97 4.22 5.28 4.58 4.35C4.58 4.35 5.13 4.17 6.36 5.03C6.88 4.89 7.43 4.82 8 4.82C8.57 4.82 9.12 4.89 9.64 5.03C10.87 4.17 11.42 4.35 11.42 4.35C11.78 5.28 11.56 5.97 11.49 6.14C11.91 6.6 12.16 7.19 12.16 7.92C12.16 10.51 10.62 11.08 9.17 11.24C9.41 11.45 9.62 11.85 9.62 12.46V14.16C9.62 14.33 9.74 14.54 10.06 14.47C12.64 13.59 14.5 11.1 14.5 8.16C14.5 4.48 11.59 1.5 8 1.5Z"/>
          </svg>
          GitHub
        </a>
      </div>
    </footer>
  );
}
