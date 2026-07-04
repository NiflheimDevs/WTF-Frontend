import { Heart } from "lucide-react";
import { useTranslation } from "../../context/LocaleContext";

const NIFLHEIM_DEVS_URL = "https://github.com/NiflheimDevs";

export function AppFooter() {
  const { t } = useTranslation();

  return (
    <footer className="px-6 py-4 text-center border-t border-neutral-200">
      <p className="text-[11px] text-neutral-400 uppercase tracking-widest">
        {t("common.footer")}
      </p>
      <p className="mt-2 inline-flex items-center justify-center gap-1 text-[11px] text-neutral-400">
        <span>{t("common.madeWithLove")}</span>
        <Heart
          size={11}
          className="text-red-500 fill-red-500 shrink-0"
          aria-hidden="true"
        />
        <span>{t("common.by")}</span>
        <a
          href={NIFLHEIM_DEVS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          NiflheimDevs
        </a>
      </p>
    </footer>
  );
}
