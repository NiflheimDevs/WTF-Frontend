import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "../components/primitives/Button";
import { useTranslation } from "../context/LocaleContext";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-neutral-0 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
          <AlertCircle size={48} className="text-neutral-400" />
        </div>

        <h1 className="text-6xl font-bold text-neutral-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-neutral-700 mb-4">
          {t("notFound.title")}
        </h2>

        <p className="text-neutral-500 mb-8">{t("notFound.description")}</p>

        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button icon={Home}>{t("notFound.goToReporter")}</Button>
          </Link>
          <Link to="/dispatcher">
            <Button variant="secondary">{t("notFound.goToDashboard")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
