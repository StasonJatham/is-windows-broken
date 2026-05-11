export type Status = "GREEN" | "YELLOW" | "RED";

export type ApiResponse = {
  ok: boolean;
  count: number;
  items: AnalysisRun[];
};

export type AnalysisRun = {
  generatedAt: string;
  patch: PatchWindow | null;
  overall: OverallAssessment;
  versions: VersionAssessment[];
};

export type PatchWindow = {
  berlinDate: string;
  patchTuesday: string;
  patchDay: string;
  activeWindow: boolean;
};

export type OverallAssessment = {
  status: Status;
  should_block_patch: boolean;
  summary: string;
  confidence: number;
  top_action?: "proceed" | "proceed_with_caution" | "delay_and_review" | null;
  recommended_action?: string;
  deployment_notes?: DeploymentNote[];
  unresolved_count?: number;
  resolved_or_mitigated_count?: number;
  latest_data_date?: string | null;
};

export type DeploymentNote = {
  level: "info" | "caution" | "blocker";
  title: string;
  detail: string;
  url?: string;
};

export type VersionAssessment = {
  version: string;
  status: Status;
  should_block_patch: boolean;
  summary: string;
  data_date: string;
};

const DEFAULT_API_URL = "https://api.is-windows-broken.com/api/v1/patch-status";
const API_URL = import.meta.env.PUBLIC_API_URL?.trim() || DEFAULT_API_URL;
const CACHE_KEY = "last-status-response-v2";

const statusColors: Record<Status, string> = {
  GREEN: "#3fa36b",
  YELLOW: "#e6a21a",
  RED: "#d93832"
};

export function getRecommendation(run: AnalysisRun) {
  const { status, should_block_patch } = run.overall;

  if (should_block_patch || status === "RED") {
    return {
      state: "wait",
      word: "YES.",
      title: "Windows update risk is high.",
      description: "Active blocking issues detected.",
      action: "WAIT",
      actionDescription: "Do not roll out broadly yet.",
      color: "red"
    } as const;
  }

  if (status === "YELLOW") {
    return {
      state: "caution",
      word: "CAUTION.",
      title: "Windows update risk needs validation.",
      description: "No active blocker, but recent issues justify staged rollout.",
      action: "STAGE FIRST",
      actionDescription: "Validate critical systems before broad rollout.",
      color: "yellow"
    } as const;
  }

  return {
    state: "ok",
    word: "NO.",
    title: "Windows update risk is low.",
    description: "No active blocking issues detected.",
    action: "OK TO INSTALL",
    actionDescription: "Safe for normal staged rollout.",
    color: "green"
  } as const;
}

function byNewest(a: AnalysisRun, b: AnalysisRun): number {
  return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
}

function byOldest(a: AnalysisRun, b: AnalysisRun): number {
  return new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime();
}

function getLatest(data: ApiResponse): AnalysisRun {
  return sanitizeRun(data.items.slice().sort(byNewest)[0]);
}

function getHistory(data: ApiResponse): AnalysisRun[] {
  return data.items.slice().sort(byOldest).slice(-10).map(sanitizeRun);
}

function sanitizeVersionSummary(version: VersionAssessment, overall: OverallAssessment): VersionAssessment {
  const summary = String(version.summary || "").trim();

  if (version.status !== "YELLOW") {
    return { ...version, summary };
  }

  if (!/no active issues/i.test(summary)) {
    return { ...version, summary };
  }

  const fallback = /mitigated/i.test(overall.summary)
    ? "Mitigated issue requires caution."
    : "Caution item requires staged rollout validation.";

  return {
    ...version,
    summary: fallback
  };
}

function sanitizeRun(run: AnalysisRun): AnalysisRun {
  const notes = Array.isArray(run.overall.deployment_notes) ? run.overall.deployment_notes : [];
  return {
    ...run,
    overall: {
      ...run.overall,
      deployment_notes: notes.filter((note) => note && typeof note.title === "string" && typeof note.detail === "string")
    },
    versions: Array.isArray(run.versions)
      ? run.versions.map((version) => sanitizeVersionSummary(version, run.overall))
      : []
  };
}

function query<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing DOM node: ${selector}`);
  }
  return element;
}

function setText(selector: string, value: string): void {
  query(selector).textContent = value;
}

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function formatDateTime(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false
  }).format(date);
  return `${day} - ${time} UTC`;
}

function formatPercent(value: number | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `${Math.round(value * 100)}%`;
}

function statusLabel(status: Status): string {
  if (status === "GREEN") return "GREEN";
  if (status === "YELLOW") return "YELLOW";
  return "RED";
}

function makeStatusPill(status: Status): HTMLSpanElement {
  const pill = document.createElement("span");
  pill.className = "status-pill";
  pill.textContent = statusLabel(status);
  pill.style.setProperty("--pill-color", statusColors[status]);
  pill.style.setProperty("--pill-bg", status === "GREEN" ? "#eaf7ef" : status === "YELLOW" ? "#fff7df" : "#fff0ef");
  pill.style.setProperty("--pill-border", status === "GREEN" ? "#c8ead5" : status === "YELLOW" ? "#f4dda3" : "#f3c7c4");
  return pill;
}

function actionLabel(action?: OverallAssessment["top_action"]): string {
  if (action === "delay_and_review") return "Delay and review";
  if (action === "proceed_with_caution") return "Stage first";
  return "Proceed";
}

function renderRolloutDetails(run: AnalysisRun): void {
  const action = query<HTMLParagraphElement>("#rollout-action");
  const signal = query<HTMLParagraphElement>("#signal-summary");
  const notes = query<HTMLUListElement>("#deployment-notes");
  const source = query<HTMLParagraphElement>("#source-freshness");
  const overall = run.overall;
  const recommendation = getRecommendation(run);
  const deploymentNotes = overall.deployment_notes ?? [];

  action.textContent = overall.recommended_action?.trim() || recommendation.actionDescription;
  signal.textContent = `${actionLabel(overall.top_action)}. Active blockers: ${overall.unresolved_count ?? 0}. Resolved or mitigated context: ${overall.resolved_or_mitigated_count ?? deploymentNotes.length}.`;
  source.textContent = `Latest analysis: ${formatDateTime(run.generatedAt)}. Source data: ${formatDate(overall.latest_data_date)}.`;
  notes.replaceChildren();

  if (deploymentNotes.length === 0) {
    const item = document.createElement("li");
    item.className = "note-item note-item-info";
    item.textContent = "No active Microsoft release-health blockers were returned for the tracked releases.";
    notes.append(item);
    return;
  }

  for (const note of deploymentNotes.slice(0, 4)) {
    const item = document.createElement("li");
    item.className = `note-item note-item-${note.level}`;

    const title = document.createElement("strong");
    title.textContent = note.title;

    const detail = document.createElement("span");
    detail.textContent = note.detail;

    item.append(title, detail);
    if (note.url) {
      const link = document.createElement("a");
      link.href = note.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "Microsoft source";
      item.append(link);
    }
    notes.append(item);
  }
}

function renderVersions(versions: VersionAssessment[]): void {
  const tbody = query<HTMLTableSectionElement>("#versions-table-body");
  const list = query<HTMLDivElement>("#versions-list");
  tbody.replaceChildren();
  list.replaceChildren();

  if (versions.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No tracked release data returned by the API.";
    row.append(cell);
    tbody.append(row);

    const article = document.createElement("article");
    article.className = "release-row";
    article.textContent = "No tracked release data returned by the API.";
    list.append(article);
    return;
  }

  for (const version of versions) {
    const row = document.createElement("tr");

    const name = document.createElement("td");
    name.textContent = version.version;

    const status = document.createElement("td");
    status.append(makeStatusPill(version.status));

    const block = document.createElement("td");
    block.textContent = version.should_block_patch ? "Yes" : "No";

    const summary = document.createElement("td");
    summary.textContent = version.summary;

    row.append(name, status, block, summary);
    tbody.append(row);

    const article = document.createElement("article");
    article.className = "release-row";

    const title = document.createElement("p");
    title.className = "release-title";
    const dot = document.createElement("span");
    dot.className = "status-dot";
    dot.style.color = statusColors[version.status];
    const titleText = document.createElement("span");
    titleText.textContent = version.version;
    title.append(dot, titleText);

    const meta = document.createElement("p");
    meta.className = "release-meta";
    meta.textContent = `${statusLabel(version.status)} | Block rollout: ${version.should_block_patch ? "Yes" : "No"}`;

    const text = document.createElement("p");
    text.className = "release-summary";
    text.textContent = version.summary;

    article.append(title, meta, text);
    list.append(article);
  }
}

function renderHistory(history: AnalysisRun[]): void {
  const list = query<HTMLOListElement>("#history-list");
  const svgHost = query<HTMLDivElement>("#history-svg");
  list.replaceChildren();

  if (history.length === 0) {
    list.textContent = "No analysis history returned by the API.";
    svgHost.replaceChildren();
    return;
  }

  const width = 640;
  const height = 76;
  const left = 18;
  const right = width - 18;
  const points = history.map((run, index) => {
    const status = run.overall.status;
    const x = history.length === 1 ? width / 2 : left + ((right - left) * index) / (history.length - 1);
    const y = status === "GREEN" ? 52 : status === "YELLOW" ? 38 : 24;
    return { x, y, status };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  svgHost.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Ten day analysis history">
      <polyline points="${line}" fill="none" stroke="#d1d5db" stroke-width="2"></polyline>
      ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="7" fill="${statusColors[point.status]}" stroke="#fff" stroke-width="3"></circle>`).join("")}
    </svg>
  `;

  for (const run of history.slice().reverse()) {
    const item = document.createElement("li");
    item.className = "history-item";

    const dot = document.createElement("span");
    dot.className = "status-dot";
    dot.style.color = statusColors[run.overall.status];

    const status = document.createElement("span");
    status.className = "history-status";
    status.style.setProperty("--item-color", statusColors[run.overall.status]);
    status.textContent = `${statusLabel(run.overall.status)} ${run.overall.should_block_patch ? "BLOCK" : "GO"}`;

    const time = document.createElement("time");
    time.dateTime = run.generatedAt;
    time.textContent = formatDateTime(run.generatedAt);

    const confidence = document.createElement("span");
    confidence.className = "history-confidence";
    confidence.textContent = formatPercent(run.overall.confidence);

    item.append(dot, status, time, confidence);
    list.append(item);
  }
}

function renderStatus(data: ApiResponse, cached = false): void {
  const latest = getLatest(data);
  const history = getHistory(data);
  const recommendation = getRecommendation(latest);

  document.documentElement.dataset.status = recommendation.color;
  document.title = `${recommendation.word} ${recommendation.title} | is-windows-broken.com`;

  setText("#status-word", recommendation.word);
  setText("#status-title", recommendation.title);
  setText("#status-description", recommendation.description);
  setText("#status-meta span", formatDateTime(latest.generatedAt));
  setText("#history-count", `${history.length} cached analysis${history.length === 1 ? "" : "es"}`);

  const note = query<HTMLParagraphElement>("#status-note");
  if (cached) {
    note.hidden = false;
    note.textContent = "Showing last successful analysis.";
  } else {
    note.hidden = true;
    note.textContent = "";
  }

  renderVersions(latest.versions);
  renderRolloutDetails(latest);
  renderHistory(history);
}

function renderCachedStatus(data: ApiResponse): void {
  renderStatus(data, true);
}

function renderUnknownState(): void {
  document.documentElement.dataset.status = "yellow";
  document.title = "UNKNOWN. Windows update analysis unavailable | is-windows-broken.com";
  setText("#status-word", "UNKNOWN.");
  setText("#status-title", "Could not fetch latest Windows update analysis.");
  setText("#status-description", "The public API did not return a usable response. Try again shortly.");
  setText("#status-meta span", "unavailable");
  setText("#history-count", "No cached analyses");
  setText("#rollout-action", "No live rollout guidance is available.");
  setText("#signal-summary", "API response unavailable.");
  setText("#source-freshness", "Latest analysis unavailable.");
  query<HTMLUListElement>("#deployment-notes").replaceChildren();
  query<HTMLParagraphElement>("#status-note").hidden = true;
}

function readCache(): ApiResponse | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? (JSON.parse(cached) as ApiResponse) : null;
  } catch {
    return null;
  }
}

function writeCache(data: ApiResponse): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Cache failures should not block rendering live API data.
  }
}

async function loadStatus(): Promise<void> {
  try {
    const requestUrl = new URL(API_URL);
    requestUrl.searchParams.set("ts", String(Date.now()));

    const response = await fetch(requestUrl.toString(), {
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = (await response.json()) as ApiResponse;

    if (!data.ok || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("Invalid API response");
    }

    writeCache(data);
    renderStatus(data);
  } catch {
    const cached = readCache();

    if (cached) {
      renderCachedStatus(cached);
    } else {
      renderUnknownState();
    }
  }
}

function setupCopyButtons(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
    button.addEventListener("click", async () => {
      const text = button.dataset.copy ?? "";
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.append(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      const original = button.textContent ?? "Copy";
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1800);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupCopyButtons();
  void loadStatus();
  window.setInterval(loadStatus, 5 * 60 * 1000);
});
