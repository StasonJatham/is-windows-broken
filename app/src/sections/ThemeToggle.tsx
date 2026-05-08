import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const icons = {
    light: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1V2.5M8 13.5V15M1 8H2.5M13.5 8H15M3.05 3.05L4.1 4.1M11.9 11.9L12.95 12.95M3.05 12.95L4.1 11.9M11.9 4.1L12.95 3.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    dark: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.5 9.5C13.5 12.5376 11.0376 15 8 15C4.96243 15 2.5 12.5376 2.5 9.5C2.5 6.46243 4.96243 4 8 4C8.5 4 9 4.08 9.46 4.23C8.85 5.03 8.5 6.02 8.5 7.08C8.5 9.53 10.48 11.51 12.93 11.51C13.13 11.51 13.32 11.49 13.5 11.46V9.5Z" fill="currentColor" />
      </svg>
    ),
    system: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="2.5" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 14.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 12.5V14.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  };

  const labels: Record<string, string> = {
    light: 'Light',
    dark: 'Dark',
    system: 'Auto',
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-5 right-5 z-50 font-body flex items-center gap-2 transition-all duration-200"
      style={{
        padding: '8px 14px',
        fontSize: '0.8125rem',
        borderRadius: '8px',
        border: '1px solid var(--border-card)',
        background: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget).style.borderColor = 'var(--border-medium)';
        (e.currentTarget).style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget).style.borderColor = 'var(--border-card)';
        (e.currentTarget).style.color = 'var(--text-secondary)';
      }}
      aria-label={`Theme: ${labels[theme]}. Click to cycle.`}
    >
      {icons[theme]}
      <span className="hidden sm:inline">{labels[theme]}</span>
    </button>
  );
}
