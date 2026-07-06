import { useMemo } from "react";
import { useTranslation } from "../../context/LocaleContext";
import { useResizeWidth } from "../../hooks/useResizeWidth";
import { SegmentedControl } from "../primitives/SegmentedControl";
import { Skeleton } from "../primitives/Skeleton";
import { cn } from "../../utils/cn";
import { compactNumber } from "../../utils/formatters";
import { formatDateTime } from "../../utils/localeDigits";
import { getRegionName } from "../../utils/regionName";

// ── Date helpers (metric_date is a UTC "YYYY-MM-DD" string) ────────────────
function parseISODate(str) {
  const [y, m, d] = String(str).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function eachDay(from, to) {
  const days = [];
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

// Literal class strings so Tailwind's scanner generates every variant used.
const DEFAULT_SERIES = [
  {
    key: "request_count",
    labelKey: "dashboard.metricRequests",
    color: "text-primary-500",
    dot: "bg-primary-500",
  },
  {
    key: "dispatched_count",
    labelKey: "dashboard.dispatched",
    color: "text-cyan-500",
    dot: "bg-cyan-500",
  },
  {
    key: "fulfilled_count",
    labelKey: "dashboard.fulfilled",
    color: "text-success-fg",
    dot: "bg-success-fg",
  },
  {
    key: "cancelled_count",
    labelKey: "dashboard.cancelled",
    color: "text-danger-fg",
    dot: "bg-danger-fg",
  },
];

const NEED_PALETTE = [
  { color: "text-primary-500", dot: "bg-primary-500" },
  { color: "text-success-fg", dot: "bg-success-fg" },
  { color: "text-warning-fg", dot: "bg-warning-fg" },
  { color: "text-cyan-500", dot: "bg-cyan-500" },
  { color: "text-violet-500", dot: "bg-violet-500" },
  { color: "text-danger-fg", dot: "bg-danger-fg" },
  { color: "text-teal-500", dot: "bg-teal-500" },
  { color: "text-orange-500", dot: "bg-orange-500" },
];

// Transform raw API points into chart series with a contiguous date domain.
// Missing days are filled with 0 so the x-axis stays even.
function buildSeries(points, groupByNeed, t) {
  if (!points || points.length === 0) return { series: [], days: [] };

  const dates = points.map((p) => p.metric_date).sort();
  const days = eachDay(parseISODate(dates[0]), parseISODate(dates[dates.length - 1]));
  const dayKeys = days.map(toISODate);

  const rowsByDate = new Map();
  for (const p of points) {
    if (!rowsByDate.has(p.metric_date)) rowsByDate.set(p.metric_date, []);
    rowsByDate.get(p.metric_date).push(p);
  }

  if (groupByNeed) {
    const needOrder = [];
    const needName = new Map();
    for (const p of points) {
      const id = p.need_type?.id;
      if (id && !needName.has(id)) {
        needName.set(id, p.need_type?.name || id);
        needOrder.push(id);
      }
    }
    const series = needOrder.map((id, idx) => {
      const { color, dot } = NEED_PALETTE[idx % NEED_PALETTE.length];
      const values = dayKeys.map((dk) => {
        const rows = (rowsByDate.get(dk) || []).filter((r) => r.need_type?.id === id);
        return rows.reduce((sum, r) => sum + (Number(r.request_count) || 0), 0);
      });
      return { key: id, label: needName.get(id), color, dot, values };
    });
    return { series, days };
  }

  const series = DEFAULT_SERIES.map((def) => {
    const values = dayKeys.map((dk) => {
      const rows = rowsByDate.get(dk) || [];
      return rows.reduce((sum, r) => sum + (Number(r[def.key]) || 0), 0);
    });
    return { key: def.key, label: t(def.labelKey), color: def.color, dot: def.dot, values };
  });
  return { series, days };
}

const PAD = { top: 14, right: 16, bottom: 26, left: 44 };
const CHART_HEIGHT = 240;

function ChartSvg({ width, series, days, locale }) {
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;

  const maxValue = useMemo(() => {
    const top = series.reduce(
      (max, s) => Math.max(max, ...s.values),
      0,
    );
    return top > 0 ? top : 1;
  }, [series]);

  const xFor = (i) =>
    days.length <= 1
      ? PAD.left + plotW / 2
      : PAD.left + (i / (days.length - 1)) * plotW;
  const yFor = (v) => PAD.top + plotH - (v / maxValue) * plotH;

  const gridTicks = [0, 0.25, 0.5, 0.75, 1];
  const labelStep = Math.max(1, Math.ceil(days.length / 8));
  const showDots = days.length <= 14;

  const areaFor = (s) => {
    if (s.values.length === 0) return "";
    const baseline = yFor(0);
    const segments = s.values
      .map((v, i) => `L ${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`)
      .join(" ");
    return `M ${xFor(0).toFixed(1)},${baseline.toFixed(1)} ${segments} L ${xFor(
      s.values.length - 1,
    ).toFixed(1)},${baseline.toFixed(1)} Z`;
  };

  const lineFor = (s) => {
    if (s.values.length === 0) return "";
    if (s.values.length === 1) return ""; // single point → drawn as a dot
    return (
      "M " +
      s.values
        .map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`)
        .join(" L ")
    );
  };

  return (
    <svg
      width={width}
      height={CHART_HEIGHT}
      role="img"
      aria-label="Time series chart"
      className="overflow-visible ltr-isolate"
    >
      {/* gridlines + y-axis labels */}
      {gridTicks.map((f) => {
        const value = maxValue * f;
        const y = yFor(value);
        return (
          <g key={f}>
            <line
              x1={PAD.left}
              y1={y}
              x2={PAD.left + plotW}
              y2={y}
              stroke="var(--color-neutral-200)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y + 3}
              textAnchor="end"
              fontSize={10}
              fill="var(--color-neutral-400)"
            >
              {compactNumber(Math.round(value), locale)}
            </text>
          </g>
        );
      })}

      {/* x-axis labels (every Nth day) */}
      {days.map((day, i) => {
        if (i % labelStep !== 0 && i !== days.length - 1) return null;
        return (
          <text
            key={toISODate(day)}
            x={xFor(i)}
            y={CHART_HEIGHT - 8}
            textAnchor="middle"
            fontSize={10}
            fill="var(--color-neutral-400)"
          >
            {formatDateTime(day, locale, { day: "2-digit", month: "short" })}
          </text>
        );
      })}

      {/* series: area + line + dots, colored via currentColor */}
      {series.map((s) => (
        <g key={s.key} className={s.color}>
          {s.values.length > 1 && (
            <path
              d={areaFor(s)}
              fill="currentColor"
              fillOpacity={0.08}
              stroke="none"
            />
          )}
          <path
            d={lineFor(s)}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {showDots &&
            s.values.map((v, i) => (
              <circle
                key={i}
                cx={xFor(i)}
                cy={yFor(v)}
                r={2.5}
                fill="currentColor"
              />
            ))}
        </g>
      ))}
    </svg>
  );
}

function EmptyState({ label }) {
  return (
    <div
      className="flex items-center justify-center text-xs text-neutral-400"
      style={{ height: CHART_HEIGHT }}
    >
      {label}
    </div>
  );
}

export function TimeSeriesChart({
  data,
  loading,
  isError,
  preset,
  onPresetChange,
  groupByNeed,
  onGroupByNeedChange,
  regionId,
  onRegionIdChange,
  regions,
  onRetry,
}) {
  const { t, locale } = useTranslation();
  const [ref, width] = useResizeWidth();
  const points = Array.isArray(data) ? data : [];

  const { series, days } = useMemo(
    () => buildSeries(points, groupByNeed, t),
    [points, groupByNeed, t],
  );

  const presetOptions = [
    { value: "7", label: t("dashboard.last7Days") },
    { value: "14", label: t("dashboard.last14Days") },
    { value: "30", label: t("dashboard.last30Days") },
  ];

  return (
    <section className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-neutral-700">
          {t(groupByNeed ? "dashboard.volumeByNeed" : "dashboard.volumeOverTime")}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={regionId || ""}
            onChange={(e) => onRegionIdChange(e.target.value)}
            aria-label={t("dashboard.allRegions")}
            className="h-7 text-xs rounded-md border border-neutral-200 bg-neutral-0 px-2 text-neutral-700 cursor-pointer hover:border-neutral-300 focus:border-primary-500 focus:outline-none max-w-[10rem]"
          >
            <option value="">{t("dashboard.allRegions")}</option>
            {(regions || []).map((r) => (
              <option key={r.id} value={r.id}>
                {getRegionName(r, locale)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onGroupByNeedChange(!groupByNeed)}
            aria-pressed={groupByNeed}
            className={cn(
              "h-7 px-2.5 rounded-md text-xs font-medium border transition-colors duration-150 cursor-pointer",
              groupByNeed
                ? "bg-primary-50 border-primary-500 text-primary-700"
                : "bg-neutral-0 border-neutral-200 text-neutral-500 hover:text-neutral-700",
            )}
          >
            {t("dashboard.groupByNeed")}
          </button>

          <SegmentedControl
            options={presetOptions}
            value={preset}
            onChange={onPresetChange}
            size="xs"
          />
        </div>
      </header>

      <div ref={ref} className="w-full">
        {loading ? (
          <div style={{ height: CHART_HEIGHT }} className="w-full">
            <Skeleton className="w-full h-full" />
          </div>
        ) : isError ? (
          <EmptyState label={t("dashboard.failedToLoad")} />
        ) : days.length === 0 || series.length === 0 ? (
          <EmptyState label={t("dashboard.noChartData")} />
        ) : (
          <ChartSvg
            width={width || 640}
            series={series}
            days={days}
            locale={locale}
          />
        )}
      </div>

      {series.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
          {series.map((s) => (
            <span
              key={s.key}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500"
            >
              <span className={cn("inline-block w-2.5 h-2.5 rounded-full", s.dot)} />
              {s.label}
            </span>
          ))}
        </div>
      )}

      {isError && onRetry && (
        <div className="mt-2 text-end">
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 cursor-pointer bg-transparent border-none"
          >
            {t("dashboard.retry")}
          </button>
        </div>
      )}
    </section>
  );
}
