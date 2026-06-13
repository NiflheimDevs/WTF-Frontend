import { useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Input } from "../components/primitives/Input";
import { User, Bell, Shield, Moon, Sun, Globe, Save, Key } from "lucide-react";
import { useTranslation } from "../context/LocaleContext";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { t, locale, setLocale } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    soundAlerts: false,
    desktopNotifications: true,
  });

  const handleProfileUpdate = useCallback(async () => {
    try {
      toast.success(t("settings.profileUpdated"));
    } catch {
      toast.error(t("settings.profileUpdateFailed"));
    }
  }, [t]);

  const handlePasswordUpdate = useCallback(async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("settings.passwordsNoMatch"));
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error(t("settings.passwordMinLength"));
      return;
    }

    try {
      toast.success(t("settings.passwordUpdated"));
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      toast.error(t("settings.passwordUpdateFailed"));
    }
  }, [passwordForm, t]);

  return (
    <div className="min-h-screen bg-neutral-0">
      <Sidebar
        user={user}
        onLogout={logout}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <TopBar
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={() => setMobileMenuOpen((open) => !open)}
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
                  <User size={18} className="text-primary-500" />
                  <CardTitle>{t("settings.profileInfo")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label={t("settings.fullName")}
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder={t("settings.fullNamePlaceholder")}
                  />
                  <Input
                    label={t("settings.emailAddress")}
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder={t("settings.emailPlaceholder")}
                    disabled
                    hint={t("settings.emailCannotChange")}
                  />
                  <Button onClick={handleProfileUpdate} icon={Save}>
                    {t("settings.saveChanges")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key size={18} className="text-primary-500" />
                  <CardTitle>{t("settings.changePassword")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label={t("settings.currentPassword")}
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder={t("settings.currentPasswordPlaceholder")}
                  />
                  <Input
                    label={t("settings.newPassword")}
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder={t("settings.newPasswordPlaceholder")}
                  />
                  <Input
                    label={t("settings.confirmNewPassword")}
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder={t("settings.confirmNewPasswordPlaceholder")}
                  />
                  <Button
                    onClick={handlePasswordUpdate}
                    icon={Key}
                    variant="secondary"
                  >
                    {t("settings.updatePassword")}
                  </Button>
                </div>
              </CardContent>
            </Card>

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

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-primary-500" />
                  <CardTitle>{t("settings.notifications")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">
                        {t("settings.emailAlerts")}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {t("settings.emailAlertsHint")}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailAlerts}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailAlerts: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">
                        {t("settings.soundAlerts")}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {t("settings.soundAlertsHint")}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.soundAlerts}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          soundAlerts: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">
                        {t("settings.desktopNotifications")}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {t("settings.desktopNotificationsHint")}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.desktopNotifications}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          desktopNotifications: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-primary-500"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="border-danger-fg/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-danger-fg" />
                  <CardTitle>{t("settings.dangerZone")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-danger-fg">
                        {t("settings.clearAllData")}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {t("settings.clearAllDataHint")}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => toast.error(t("settings.destructiveAction"))}
                    >
                      {t("settings.clearData")}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                    <div>
                      <p className="text-sm font-semibold text-danger-fg">
                        {t("settings.deleteAccount")}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {t("settings.deleteAccountHint")}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        toast.error(t("settings.contactSupportDelete"))
                      }
                    >
                      {t("settings.deleteAccount")}
                    </Button>
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
