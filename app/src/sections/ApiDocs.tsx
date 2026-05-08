import { PATCH_API_URL } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const codeExamples = (apiUrl: string) => [
  {
    label: 'cURL',
    code: `curl -s ${apiUrl} | jq .`,
  },
  {
    label: 'JavaScript',
    code: `const response = await fetch('${apiUrl}');
const data = await response.json();

if (data.ok && data.items.length > 0) {
  const latest = data.items[0];
  console.log(latest.overall.status);
  console.log(latest.overall.summary);
  console.log(latest.versions.map((v) => [v.version, v.status]));
}`,
  },
  {
    label: 'Python',
    code: `from pprint import pprint
import requests

resp = requests.get('${apiUrl}', timeout=20)
data = resp.json()

if data['ok'] and data['items']:
    latest = data['items'][0]
    pprint(latest['overall'])
    for version in latest['versions']:
        print(f"{version['version']}: {version['status']}")`,
  },
];

type CodeLanguage = 'bash' | 'javascript' | 'python';

type CodeToken = {
  value: string;
  kind: 'plain' | 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'function' | 'property';
};

const languageByLabel: Record<string, CodeLanguage> = {
  cURL: 'bash',
  JavaScript: 'javascript',
  Python: 'python',
};

const keywordMap: Record<CodeLanguage, string[]> = {
  bash: ['curl'],
  javascript: ['const', 'await', 'if', 'true', 'false', 'null'],
  python: ['from', 'import', 'if', 'for', 'in', 'True', 'False', 'None'],
};

function tokenizeLine(line: string, language: CodeLanguage): CodeToken[] {
  const keywords = new Set(keywordMap[language]);
  const tokens: CodeToken[] = [];
  let index = 0;

  const pushPlain = (value: string) => {
    if (value) tokens.push({ value, kind: 'plain' });
  };

  while (index < line.length) {
    const rest = line.slice(index);

    if (language === 'python' && rest.startsWith('#')) {
      tokens.push({ value: rest, kind: 'comment' });
      break;
    }
    if (language === 'javascript' && rest.startsWith('//')) {
      tokens.push({ value: rest, kind: 'comment' });
      break;
    }

    const stringMatch = rest.match(/^(`[^`]*`|'[^']*'|"[^"]*")/);
    if (stringMatch) {
      tokens.push({ value: stringMatch[0], kind: 'string' });
      index += stringMatch[0].length;
      continue;
    }

    const numberMatch = rest.match(/^\d+(\.\d+)?/);
    if (numberMatch) {
      tokens.push({ value: numberMatch[0], kind: 'number' });
      index += numberMatch[0].length;
      continue;
    }

    const propertyMatch = rest.match(/^\.[A-Za-z_][A-Za-z0-9_]*/);
    if (propertyMatch) {
      tokens.push({ value: propertyMatch[0], kind: 'property' });
      index += propertyMatch[0].length;
      continue;
    }

    const functionMatch = rest.match(/^[A-Za-z_][A-Za-z0-9_]*(?=\()/);
    if (functionMatch) {
      tokens.push({ value: functionMatch[0], kind: 'function' });
      index += functionMatch[0].length;
      continue;
    }

    const wordMatch = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (wordMatch) {
      const value = wordMatch[0];
      tokens.push({ value, kind: keywords.has(value) ? 'keyword' : 'plain' });
      index += value.length;
      continue;
    }

    const operatorMatch = rest.match(/^(=>|===|!==|==|!=|>=|<=|=|\+|-|\||:|\[|\]|\{|\}|\(|\)|,)/);
    if (operatorMatch) {
      tokens.push({ value: operatorMatch[0], kind: 'operator' });
      index += operatorMatch[0].length;
      continue;
    }

    pushPlain(rest[0]);
    index += 1;
  }

  return tokens;
}

function HighlightedCode({ code, language }: { code: string; language: CodeLanguage }) {
  const lines = code.split('\n');
  const tokenColor: Record<CodeToken['kind'], string> = {
    plain: 'var(--text-on-dark)',
    keyword: 'var(--code-keyword)',
    string: 'var(--code-string)',
    comment: 'var(--code-comment)',
    number: 'var(--code-number)',
    operator: 'var(--code-operator)',
    function: 'var(--code-function)',
    property: 'var(--code-property)',
  };

  return (
    <code>
      {lines.map((line, lineIndex) => (
        <span key={`${language}-${lineIndex}`} className="block">
          {tokenizeLine(line, language).map((token, tokenIndex) => (
            <span
              key={`${language}-${lineIndex}-${tokenIndex}`}
              style={{ color: tokenColor[token.kind] }}
            >
              {token.value}
            </span>
          ))}
          {lineIndex < lines.length - 1 ? '\n' : ''}
        </span>
      ))}
    </code>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="font-body flex items-center gap-1.5 transition-all duration-200"
      style={{
        padding: '4px 10px',
        fontSize: '0.75rem',
        borderRadius: '6px',
        border: '1px solid var(--border-card)',
        background: copied ? 'var(--green-soft)' : 'var(--bg-code-header)',
        color: copied ? 'var(--green-text)' : 'var(--code-header-text)',
        cursor: 'pointer',
      }}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6 1H13V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

export function ApiDocs() {
  const sectionRef = useRef<HTMLElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  const examples = codeExamples(PATCH_API_URL);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const blocks = blocksRef.current?.querySelectorAll('.code-block');
      blocks?.forEach((b) => { (b as HTMLElement).style.opacity = '1'; });
      return;
    }

    const ctx = gsap.context(() => {
      const blocks = blocksRef.current?.querySelectorAll('.code-block');
      if (!blocks) return;
      gsap.fromTo(
        blocks,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: blocksRef.current,
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
        marginBottom: '4rem',
        padding: `0 var(--page-pad-x)`,
        maxWidth: '920px',
        marginLeft: 'auto',
        marginRight: 'auto',
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
        Use the API
      </h2>
      <p
        className="font-body mt-2"
        style={{
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
        }}
      >
        The public endpoint returns the last 10 cached patch analyses. The site renders the newest item, and your tools can do the same.
      </p>

      <div
        ref={blocksRef}
        className="mt-6 flex flex-col gap-4"
      >
        {examples.map((example) => (
          <div
            key={example.label}
            className="code-block overflow-hidden"
            style={{
              background: 'var(--bg-code)',
              borderRadius: '12px',
              border: '1px solid var(--border-card)',
              opacity: 0,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4"
              style={{
                background: 'var(--bg-code-header)',
                padding: '0.625rem 1rem',
                borderBottom: '1px solid var(--border-card)',
              }}
            >
              {/* Terminal dots + label */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="block rounded-full" style={{ width: '8px', height: '8px', background: '#EF4444' }} />
                  <span className="block rounded-full" style={{ width: '8px', height: '8px', background: '#F59E0B' }} />
                  <span className="block rounded-full" style={{ width: '8px', height: '8px', background: '#22C55E' }} />
                </div>
                <span
                  className="font-code"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--code-header-text)',
                    marginLeft: '4px',
                  }}
                >
                  {example.label}
                </span>
              </div>
              <CopyButton code={example.code} />
            </div>

            {/* Code */}
            <div style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <pre
                className="font-code"
                style={{
                  fontSize: '0.8125rem',
                  lineHeight: 1.7,
                  margin: 0,
                  color: 'var(--text-on-dark)',
                  whiteSpace: 'pre',
                }}
              >
                <HighlightedCode
                  code={example.code}
                  language={languageByLabel[example.label]}
                />
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Endpoint badges */}
      <div className="mt-4 flex flex-wrap gap-3">
        <span
          className="font-code"
          style={{
            fontSize: '0.8125rem',
            padding: '4px 12px',
            borderRadius: '6px',
            background: 'var(--accent-blue-soft)',
            color: 'var(--accent-blue)',
          }}
        >
          GET /api/v1/patch-status
        </span>
        <span
          className="font-code"
          style={{
            fontSize: '0.8125rem',
            padding: '4px 12px',
            borderRadius: '6px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-card)',
          }}
        >
          No auth required
        </span>
        <span
          className="font-code"
          style={{
            fontSize: '0.8125rem',
            padding: '4px 12px',
            borderRadius: '6px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-card)',
          }}
        >
          Host: api.is-windows-broken.com
        </span>
      </div>
    </section>
  );
}
