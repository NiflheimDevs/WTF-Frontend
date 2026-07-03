import { useTheme } from "../hooks/useTheme";
import { useSidebarMobile } from "../context/SidebarMobileContext";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Moon, Sun, Globe } from "lucide-react";
import { useTranslation } from "../context/LocaleContext";

export default function SettingsPage() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { mobileOpen, toggle, close } = useSidebarMobile();
  const { t, locale, setLocale } = useTranslation();

  return (
    <div className="min-h-screen bg-neutral-0">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={close} />

      <TopBar
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={toggle}
        onRefresh={() => {}}
        refreshing={false}
      />

      <main className="pt-14 min-h-screen transition-all duration-200 ms-0 lg:ms-60">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-neutral-900">
              {t("settings.title")}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {t("settings.subtitle")}
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-primary-500" />
                  <CardTitle>{t("settings.appearance")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">
                        {t("settings.theme")}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {t("settings.themeHint")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={theme === "light" ? "primary" : "secondary"}
                        size="sm"
                        icon={Sun}
                        onClick={() => setTheme("light")}
                      >
                        {t("settings.light")}
                      </Button>
                      <Button
                        variant={theme === "dark" ? "primary" : "secondary"}
                        size="sm"
                        icon={Moon}
                        onClick={() => setTheme("dark")}
                      >
                        {t("settings.dark")}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">
                        {t("settings.language")}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {t("settings.languageHint")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={locale === "fa" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setLocale("fa")}
                      >
                        {t("settings.persian")}
                      </Button>
                      <Button
                        variant={locale === "en" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setLocale("en")}
                      >
                        {t("settings.english")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
