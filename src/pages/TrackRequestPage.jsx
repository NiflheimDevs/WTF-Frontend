import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Search, MapPin, Package, ArrowLeft } from "lucide-react";
import { Card } from "../components/primitives/Card";
import { Input } from "../components/primitives/Input";
import { Button } from "../components/primitives/Button";
import { StatusBadge } from "../components/dispatcher/StatusBadge";
import { RequestStatusTimeline } from "../components/reporter/RequestStatusTimeline";
import { useTrackRequest } from "../hooks/useTrackRequest";
import { useTranslation } from "../context/LocaleContext";
import { NEED_TYPES } from "../api/types";
import { getRequestRegionName } from "../utils/regionName";
import { formatters } from "../utils/formatters";
import { formatNumber } from "../utils/localeDigits";
import toast from "react-hot-toast";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getNeedTypeLabel(needType, t) {
  if (needType === NEED_TYPES.TANKER) return t("reporter.tankerTruck");
  if (needType === NEED_TYPES.BOTTLED_WATER) return t("reporter.waterBottles");
  return needType;
}

export default function TrackRequestPage() {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();

  const urlId = (routeId || searchParams.get("id") || "").trim();
  const [referenceId, setReferenceId] = useState(urlId || "");
  const [inputError, setInputError] = useState("");
  const [lookupId, setLookupId] = useState(() =>
    urlId && UUID_REGEX.test(urlId) ? urlId : "",
  );

  const {
    data: request,
    isFetching,
    isError,
    error,
    refetch,
  } = useTrackRequest(lookupId, Boolean(lookupId));

  useEffect(() => {
    if (!isError || !error) return;

    if (error.response?.status === 404) {
      toast.error(t("track.notFound"));
    } else if (error.response?.status === 429) {
      toast.error(t("reporter.tooManyRequests"));
    } else if (error.response?.status === 400) {
      toast.error(t("track.invalidReferenceId"));
    } else {
      toast.error(t("track.lookupFailed"));
    }
  }, [isError, error, t]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmed = referenceId.trim();
    if (!trimmed) {
      setInputError(t("track.referenceIdRequired"));
      return;
    }
    if (!UUID_REGEX.test(trimmed)) {
      setInputError(t("track.invalidReferenceId"));
      return;
    }

    setInputError("");
    setLookupId(trimmed);
    navigate(`/track/${trimmed}`, { replace: true });
  };

  const regionName = getRequestRegionName(request, locale);

  return (
    <div className="min-h-screen bg-neutral-0 font-sans">
      <main className="px-4 pb-12 pt-8 w-full max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-2">
            {t("track.title")}
          </h1>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            {t("track.subtitle")}
          </p>
        </div>

        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              dir="ltr"
              label={t("track.referenceIdLabel")}
              value={referenceId}
              onChange={(event) => {
                setReferenceId(event.target.value);
                if (inputError) setInputError("");
              }}
              placeholder={t("track.referenceIdPlaceholder")}
              hint={t("track.referenceIdHint")}
              error={inputError}
            />

            <Button type="submit" fullWidth loading={isFetching} icon={Search}>
              {isFetching ? t("track.searching") : t("track.search")}
            </Button>
          </form>
        </Card>

        {request && !isError && (
          <Card className="animate-fade-in">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-200">
                <div>
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
                    {t("track.currentStatus")}
                  </p>
                  <StatusBadge status={request.status} size="lg" />
                </div>
                <div
                  className="rounded-md bg-neutral-50 border border-neutral-200 px-3 py-2 min-w-0"
                  dir="ltr"
                >
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
                    {t("reporter.referenceId")}
                  </p>
                  <p className="font-mono text-xs font-semibold text-neutral-800 truncate">
                    {request.id}
                  </p>
                </div>
              </div>

              <RequestStatusTimeline status={request.status} />

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                    <MapPin size={12} />
                    {t("requests.table.region")}
                  </dt>
                  <dd className="text-sm font-semibold text-neutral-800">
                    {regionName || t("common.unknown")}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                    <Package size={12} />
                    {t("requests.needTypeLabel")}
                  </dt>
                  <dd className="text-sm font-semibold text-neutral-800">
                    {getNeedTypeLabel(request.need_type, t)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-neutral-400 mb-1">
                    {t("requests.quantityLabel")}
                  </dt>
                  <dd className="text-sm font-semibold text-neutral-800">
                    {formatNumber(request.quantity, locale)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-neutral-400 mb-1">
                    {t("requests.createdLabel")}
                  </dt>
                  <dd className="text-sm font-semibold text-neutral-800">
                    {formatters.date.full(request.created_at, locale)}
                  </dd>
                </div>

                {request.updated_at &&
                  request.updated_at !== request.created_at && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-neutral-400 mb-1">
                        {t("track.lastUpdated")}
                      </dt>
                      <dd className="text-sm font-semibold text-neutral-800">
                        {formatters.date.full(request.updated_at, locale)}
                      </dd>
                    </div>
                  )}
              </dl>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetch()}
                loading={isFetching}
                fullWidth
              >
                {t("common.refresh")}
              </Button>
            </div>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
          >
            <ArrowLeft size={14} />
            {t("track.backToReporter")}
          </Link>
        </div>
      </main>
    </div>
  );
}
