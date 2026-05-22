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
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
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
      // API call to update profile
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  }, [profileForm]);

  const handlePasswordUpdate = useCallback(async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      // API call to update password
      toast.success("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Failed to update password");
    }
  }, [passwordForm]);

  return (
    <div className="min-h-screen bg-neutral-0">
      <Sidebar
        activeNav="settings"
        onNav={() => {}}
        user={user}
        onLogout={logout}
        collapsed={collapsed}
      />

      <TopBar
        activeNav="settings"
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={() => setCollapsed((c) => !c)}
        onRefresh={() => {}}
        refreshing={false}
        sidebarCollapsed={collapsed}
      />

      <main
        className="pt-14 min-h-screen transition-all duration-200"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-neutral-900">Settings</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Manage your account and application preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User size={18} className="text-primary-500" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="Your full name"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="your@email.com"
                    disabled
                    hint="Email cannot be changed"
                  />
                  <Button onClick={handleProfileUpdate} icon={Save}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key size={18} className="text-primary-500" />
                  <CardTitle>Change Password</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="At least 8 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                  />
                  <Button
                    onClick={handlePasswordUpdate}
                    icon={Key}
                    variant="secondary"
                  >
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-primary-500" />
                  <CardTitle>Appearance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">
                        Theme
                      </p>
                      <p className="text-xs text-neutral-400">
                        Choose your preferred theme
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={theme === "light" ? "primary" : "secondary"}
                        size="sm"
                        icon={Sun}
                        onClick={() => setTheme("light")}
                      >
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "primary" : "secondary"}
                        size="sm"
                        icon={Moon}
                        onClick={() => setTheme("dark")}
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-primary-500" />
                  <CardTitle>Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">
                        Email Alerts
                      </p>
                      <p className="text-xs text-neutral-400">
                        Receive email notifications for status updates
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
                        Sound Alerts
                      </p>
                      <p className="text-xs text-neutral-400">
                        Play sound for new requests
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
                        Desktop Notifications
                      </p>
                      <p className="text-xs text-neutral-400">
                        Show desktop notifications
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

            {/* Danger Zone */}
            <Card className="border-danger-fg/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-danger-fg" />
                  <CardTitle>Danger Zone</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-danger-fg">
                        Clear All Data
                      </p>
                      <p className="text-xs text-neutral-400">
                        Permanently remove all dashboard data
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => toast.error("This action is destructive")}
                    >
                      Clear Data
                    </Button>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                    <div>
                      <p className="text-sm font-semibold text-danger-fg">
                        Delete Account
                      </p>
                      <p className="text-xs text-neutral-400">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        toast.error("Contact support to delete account")
                      }
                    >
                      Delete Account
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
