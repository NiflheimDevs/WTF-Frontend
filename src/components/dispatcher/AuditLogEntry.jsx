import {
  ArrowRight,
  Bell,
  Clock,
  Droplet,
  FilePlus,
  Hash,
  MapPin,
  Phone,
  RefreshCw,
  StickyNote,
  User,
} from "lucide-react";
import { EVENT_TYPES, NEED_TYPES } from "../../api/types";
import { useTranslation } from "../../context/LocaleContext";
import { StatusBadge } from "./StatusBadge";
import { formatPhone, formatDateTime } from "../../utils/formatters";
import { formatNumber } from "../../utils/localeDigits";
import { cn } from "../../utils/cn";

const EVENT_CONFIG = {
  [EVENT_TYPES.REQUEST_SUBMITTED]: {
    icon: FilePlus,
    accent:
      "bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-500/40",
    dot: "bg-primary-500 dark:bg-primary-400",
  },
  [EVENT_TYPES.REQUEST_STATUS_CHANGED]: {
    icon: RefreshCw,
    accent:
      "bg-info-bg text-info-fg border-info-bg dark:border-info-fg/35",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [EVENT_TYPES.DISPATCHER_NOTIFIED]: {
    icon: Bell,
    accent:
      "bg-warning-bg text-warning-fg border-warning-bg dark:border-warning-fg/35",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [EVENT_TYPES.REQUESTER_SMS_SENT]: {
    icon: Bell,
    accent:
      "bg-warning-bg text-warning-fg border-warning-bg dark:border-warning-fg/35",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [EVENT_TYPES.METRICS_REFRESHED]: {
    icon: RefreshCw,
    accent:
      "bg-neutral-100 dark:bg-neutral-200 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-300",
    dot: "bg-neutral-400 dark:bg-neutral-500",
  },
};

const FIELD_ICONS = {
  need_type: Droplet,
  quantity: Hash,
  region_id: MapPin,
  region: MapPin,
  contact_phone: Phone,
  note: StickyNote,
  changed_by: User,
  actor: User,
  dispatcher_id: User,
};

const FIELD_ORDER = [
  "old_status",
  "from_status",
  "previous_status",
  "new_status",
  "to_status",
  "status",
  "need_type",
  "quantity",
  "region_id",
  "region",
  "contact_phone",
  "note",
  "changed_by",
  "actor",
  "dispatcher_id",
];

function getEventTitle(eventType, t) {
  const key = `requests.audit.events.${eventType}`;
  const translated = t(key);
  return translated !== key
    ? translated
    : eventType?.replace(/_/g, " ") ?? t("requests.audit.unknownEvent");
}

function getStatusTransition(payload) {
  if (!payload) return null;

  const oldStatus =
    payload.old_status ?? payload.from_status ?? payload.previous_status;
  const newStatus =
    payload.new_status ?? payload.to_status ?? payload.status;

  if (oldStatus && newStatus && oldStatus !== newStatus) {
    return { oldStatus, newStatus };
  }

  return null;
}

function getFieldLabel(key, t) {
  const labelKey = `requests.audit.fields.${key}`;
  const translated = t(labelKey);
  if (translated !== labelKey) return translated;

  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFieldValue(key, value, { t, locale }) {
  if (value == null || value === "") return null;

  if (
    key.includes("status") &&
    typeof value === "string" &&
    ["pending", "dispatched", "fulfilled", "cancelled"].includes(value)
  ) {
    return <StatusBadge status={value} size="sm" />;
  }

  if (key === "need_type") {
    if (value === NEED_TYPES.BOTTLED_WATER) return t("requests.bottledWater");
    if (value === NEED_TYPES.TANKER) return t("reporter.tankerTruck");
    return String(value).replace(/_/g, " ");
  }

  if (key === "quantity" && typeof value === "number") {
    return (
      <span className="font-mono font-semibold ltr-isolate">
        {formatNumber(value, locale)}
      </span>
    );
  }

  if (key === "contact_phone") {
    return (
      <span className="font-mono ltr-isolate">
        {formatPhone(String(value), locale)}
      </span>
    );
  }

  if (
    typeof value === "string" &&
    (key.endsWith("_at") || key.includes("date") || key.includes("time"))
  ) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return formatDateTime(value, locale);
    }
  }

  if (typeof value === "boolean") {
    return value ? t("common.yes") : t("common.no");
  }

  if (typeof value === "object") {
    return null;
  }

  if (key.endsWith("_id") || key === "id") {
    return (
      <span className="font-mono text-xs ltr-isolate break-all">{String(value)}</span>
    );
  }

  return String(value);
}

function sortPayloadEntries(entries) {
  return [...entries].sort(([keyA], [keyB]) => {
    const indexA = FIELD_ORDER.indexOf(keyA);
    const indexB = FIELD_ORDER.indexOf(keyB);
    const rankA = indexA === -1 ? FIELD_ORDER.length : indexA;
    const rankB = indexB === -1 ? FIELD_ORDER.length : indexB;
    if (rankA !== rankB) return rankA - rankB;
    return keyA.localeCompare(keyB);
  });
}

function PayloadField({ fieldKey, value, t, locale }) {
  const Icon = FIELD_ICONS[fieldKey];
  const formatted = formatFieldValue(fieldKey, value, { t, locale });
  if (!formatted) return null;

  return (
    <div className="p-2.5 bg-neutral-0 dark:bg-neutral-100 rounded-md border border-neutral-200/80 dark:border-neutral-300">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && (
          <Icon
            size={12}
            className="text-neutral-400 dark:text-neutral-500 shrink-0"
          />
        )}
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          {getFieldLabel(fieldKey, t)}
        </span>
      </div>
      <div className="text-sm text-neutral-800 dark:text-neutral-900 font-medium">
        {formatted}
      </div>
    </div>
  );
}

function StatusTransitionCard({ oldStatus, newStatus }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 p-3 bg-neutral-0 dark:bg-neutral-100 rounded-lg border border-neutral-200 dark:border-neutral-300">
      <StatusBadge status={oldStatus} size="sm" />
      <ArrowRight
        size={14}
        className="text-neutral-400 dark:text-neutral-500 shrink-0"
      />
      <StatusBadge status={newStatus} size="sm" />
    </div>
  );
}

function PayloadGrid({ payload, excludeKeys = [], t, locale }) {
  const entries = sortPayloadEntries(
    Object.entries(payload).filter(
      ([key, value]) =>
        !excludeKeys.includes(key) &&
        value != null &&
        value !== "" &&
        typeof value !== "object",
    ),
  );

  if (!entries.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {entries.map(([key, value]) => (
        <PayloadField
          key={key}
          fieldKey={key}
          value={value}
          t={t}
          locale={locale}
        />
      ))}
    </div>
  );
}

function NoteField({ note, t }) {
  return (
    <div className="p-3 bg-neutral-0 dark:bg-neutral-100 rounded-lg border border-neutral-200 dark:border-neutral-300">
      <div className="flex items-center gap-1.5 mb-1.5">
        <StickyNote size={12} className="text-neutral-400 dark:text-neutral-500" />
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          {t("requests.additionalNotes")}
        </span>
      </div>
      <p className="text-sm text-neutral-700 dark:text-neutral-700 whitespace-pre-wrap">
        {note}
      </p>
    </div>
  );
}

function PayloadBody({ payload, t, locale }) {
  if (!payload || typeof payload !== "object") return null;

  const statusTransition = getStatusTransition(payload);
  const excludeKeys = statusTransition
    ? [
        "old_status",
        "from_status",
        "previous_status",
        "new_status",
        "to_status",
        "status",
      ]
    : [];

  const note = payload.note;
  const gridPayload = { ...payload };
  if (note) {
    delete gridPayload.note;
    excludeKeys.push("note");
  }

  const hasGrid = Object.entries(gridPayload).some(
    ([key, value]) =>
      !excludeKeys.includes(key) &&
      value != null &&
      value !== "" &&
      typeof value !== "object",
  );

  if (!statusTransition && !hasGrid && !note) return null;

  return (
    <div className="space-y-2.5 mt-3">
      {statusTransition && (
        <StatusTransitionCard
          oldStatus={statusTransition.oldStatus}
          newStatus={statusTransition.newStatus}
        />
      )}
      {hasGrid && (
        <PayloadGrid
          payload={gridPayload}
          excludeKeys={excludeKeys}
          t={t}
          locale={locale}
        />
      )}
      {note && <NoteField note={note} t={t} />}
    </div>
  );
}

export function AuditLogEntry({ log, isLast = false }) {
  const { t, locale } = useTranslation();
  const config = EVENT_CONFIG[log.event_type] ?? {
    icon: Clock,
    accent:
      "bg-neutral-100 dark:bg-neutral-200 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-300",
    dot: "bg-neutral-400 dark:bg-neutral-500",
  };
  const Icon = config.icon;
  const timestamp = log.created_at
    ? formatDateTime(log.created_at, locale)
    : null;

  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border",
            config.accent,
          )}
        >
          <Icon size={16} />
        </div>
        {!isLast && (
          <div className="mt-2 w-0.5 flex-1 min-h-4 bg-neutral-200 dark:bg-neutral-300 rounded-full" />
        )}
      </div>

      <div
        className={cn(
          "flex-1 min-w-0 pb-5",
          isLast && "pb-0",
        )}
      >
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-300 bg-neutral-0 dark:bg-neutral-100 p-4 shadow-sm dark:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-900 capitalize">
                {getEventTitle(log.event_type, t)}
              </p>
              {timestamp && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                  {timestamp}
                </p>
              )}
            </div>
            <span
              className={cn(
                "h-2 w-2 rounded-full shrink-0 mt-1.5",
                config.dot,
              )}
              aria-hidden
            />
          </div>

          <PayloadBody payload={log.payload} t={t} locale={locale} />
        </div>
      </div>
    </div>
  );
}
