import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/sections/ThemeToggle';
import { HeroVerdict } from '@/sections/HeroVerdict';
import { OverallSummary } from '@/sections/OverallSummary';
import { VersionGrid } from '@/sections/VersionGrid';
import { ConfidenceSources } from '@/sections/ConfidenceSources';
import { ApiDocs } from '@/sections/ApiDocs';
import { Footer } from '@/sections/Footer';
import { fetchPatchHistory, PATCH_API_URL } from '@/lib/api';
import type { AnalysisItem } from '@/types/api';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryItem, setPrimaryItem] = useState<AnalysisItem | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await fetchPatchHistory(controller.signal);
        setPrimaryItem(data.items[0] ?? null);
        setError(data.items[0] ? null : 'No patch history is available yet.');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown API error';
        setError(`${message}. The public endpoint is ${PATCH_API_URL}.`);
      } finally {
        setIsLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!primaryItem) {
        document.title = 'Unavailable - is-windows-broken.com';
        return;
      }
      const verdict = primaryItem.overall.should_block_patch ? 'NO' : 'YES';
      document.title = `${verdict} | is-windows-broken.com`;
    }
  }, [isLoading, primaryItem]);

  const overall = primaryItem?.overall;
  const versions = primaryItem?.versions ?? [];
  const dataDate = primaryItem?.generatedAt ?? new Date().toISOString();
  const sourceDataDate =
    versions.map((version) => version.data_date).sort().at(-1) ?? null;

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Theme toggle */}
      <ThemeToggle />

      {/* Hero: Big YES/NO verdict */}
      <HeroVerdict
        shouldBlockPatch={overall?.should_block_patch ?? false}
        dataDate={dataDate}
        isLoading={isLoading}
        isUnavailable={!isLoading && !primaryItem}
      />

      {!isLoading && primaryItem && overall && (
        <>
          <OverallSummary
            status={overall.status}
            summary={overall.summary}
          />

          <VersionGrid versions={versions} />

          <ConfidenceSources
            confidence={overall.confidence}
            generatedAt={primaryItem.generatedAt}
            sourceDataDate={sourceDataDate}
          />

          <ApiDocs />

          <Footer />
        </>
      )}

      {!isLoading && !primaryItem && (
        <main
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: `0 var(--page-pad-x) 4rem`,
          }}
        >
          <section
            className="bg-card-surface"
            style={{
              borderRadius: 'var(--card-radius)',
              padding: 'var(--card-pad)',
            }}
          >
            <h2
              className="font-display font-semibold"
              style={{
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                color: 'var(--text-primary)',
              }}
            >
              Patch status unavailable
            </h2>
            <p
              className="font-body mt-3"
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}
            >
              {error ?? `The public endpoint ${PATCH_API_URL} did not return a usable patch record.`}
            </p>
          </section>
          <ApiDocs />
          <Footer />
        </main>
      )}
    </div>
  );
}

export default App;
