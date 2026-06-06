import { useState, useEffect } from "react";
import { defaultTo } from "lodash-es";
import { ArrowLeft, Sun, Moon, Monitor } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, type SupportedLanguage } from "../../constants";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { AutoSyncConfig } from "../../types";
import { useSettingsStore } from "../../stores/settingsStore";
import { useTheme } from "../../hooks/useTheme";
import { validateToken } from "../../services/auth";
import type { GitHubUser } from "../../types";
import { SyncFrequency } from "../../enums";

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const { t } = useTranslation();
  const { token, autoSync, language, setToken, setAutoSync, setLanguage, loadSettings } =
    useSettingsStore();

  const WEEKDAYS = [
    t("settings.weekdays.sun"),
    t("settings.weekdays.mon"),
    t("settings.weekdays.tue"),
    t("settings.weekdays.wed"),
    t("settings.weekdays.thu"),
    t("settings.weekdays.fri"),
    t("settings.weekdays.sat"),
  ];

  const FREQUENCY_LABELS: Record<SyncFrequency, string> = {
    daily: t("settings.frequencyDaily"),
    weekly: t("settings.frequencyWeekly"),
    monthly: t("settings.frequencyMonthly"),
  };
  const { theme, setTheme } = useTheme();
  const [tokenInput, setTokenInput] = useState(token);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // 自动同步配置本地状态
  const [syncConfig, setSyncConfig] = useState<AutoSyncConfig>(autoSync);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    setTokenInput(token);
    if (token) {
      validateToken(token)
        .then(setUser)
        .catch(() => setUser(null));
    }
  }, [token]);

  useEffect(() => {
    setSyncConfig(autoSync);
  }, [autoSync]);

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) {
      setError(t("settings.tokenRequired"));
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const userData = await validateToken(tokenInput.trim());
      setUser(userData);
      await setToken(tokenInput.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError(t("settings.tokenInvalid"));
      setUser(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveAutoSync = async () => {
    await setAutoSync(syncConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleDayOfWeek = (day: number) => {
    setSyncConfig((prev) => {
      const days = defaultTo(prev.daysOfWeek, []);
      const newDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();
      return { ...prev, daysOfWeek: newDays };
    });
  };

  return (
    <div className="flex flex-col h-full min-h-[480px] min-w-[300px] w-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft size={16} />
        </Button>
        <h2 className="text-sm font-semibold text-foreground">{t("settings.title")}</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Token 配置 */}
        <div>
          <Label className="mb-2 block">GitHub Personal Access Token</Label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="flex-1"
            />
            <Button onClick={handleSaveToken} disabled={isValidating}>
              {isValidating ? t("settings.validating") : t("common.save")}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
          {saved && <p className="text-xs text-green-600 mt-1.5">{t("settings.saveSuccess")}</p>}
          {user && (
            <div className="flex items-center gap-2 mt-2 p-2.5 bg-muted border border-border rounded-lg">
              <img src={user.avatarUrl} alt={user.login} className="w-7 h-7 rounded-full" />
              <div>
                <span className="text-xs text-foreground font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground ml-1">@{user.login}</span>
              </div>
            </div>
          )}
        </div>

        {/* 主题 */}
        <div>
          <Label className="mb-2 block">{t("settings.theme")}</Label>
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="icon"
              onClick={() => setTheme("light")}
              className="h-10 w-10"
            >
              <Sun size={16} />
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="icon"
              onClick={() => setTheme("dark")}
              className="h-10 w-10"
            >
              <Moon size={16} />
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              size="icon"
              onClick={() => setTheme("system")}
              className="h-10 w-10"
            >
              <Monitor size={16} />
            </Button>
          </div>
        </div>

        {/* 语言 */}
        <div>
          <Label className="mb-2 block">{t("settings.language")}</Label>
          <Select value={language} onValueChange={(val) => setLanguage(val as SupportedLanguage)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lng) => (
                <SelectItem key={lng} value={lng}>
                  {LANGUAGE_LABELS[lng]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 自动同步配置 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="auto-sync-enabled"
              checked={syncConfig.enabled}
              onCheckedChange={(checked) =>
                setSyncConfig((prev) => ({ ...prev, enabled: checked as boolean }))
              }
            />
            <Label htmlFor="auto-sync-enabled" className="cursor-pointer">
              {t("settings.enableAutoSync")}
            </Label>
          </div>

          {syncConfig.enabled && (
            <div className="pl-6 space-y-4 border-l-2 border-muted">
              {/* 频率选择 */}
              <div>
                <Label className="mb-2 block text-xs">{t("settings.syncFrequency")}</Label>
                <div className="flex gap-2">
                  {Object.values(SyncFrequency).map((freq) => (
                    <Button
                      key={freq}
                      variant={syncConfig.frequency === freq ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSyncConfig((prev) => ({ ...prev, frequency: freq }))}
                    >
                      {FREQUENCY_LABELS[freq]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 每周：选择星期 */}
              {syncConfig.frequency === "weekly" && (
                <div>
                  <Label className="mb-2 block text-xs">{t("settings.selectWeekday")}</Label>
                  <div className="flex gap-1.5">
                    {WEEKDAYS.map((day, index) => (
                      <Button
                        key={index}
                        variant={
                          defaultTo(syncConfig.daysOfWeek, []).includes(index)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="w-9 h-9 p-0"
                        onClick={() => toggleDayOfWeek(index)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 每月：选择日期 */}
              {syncConfig.frequency === "monthly" && (
                <div>
                  <Label className="mb-2 block text-xs">{t("settings.dayOfMonth")}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={defaultTo(syncConfig.dayOfMonth, 1)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1 && val <= 31) {
                        setSyncConfig((prev) => ({ ...prev, dayOfMonth: val }));
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val) || val < 1) {
                        setSyncConfig((prev) => ({ ...prev, dayOfMonth: 1 }));
                      } else if (val > 31) {
                        setSyncConfig((prev) => ({ ...prev, dayOfMonth: 31 }));
                      }
                    }}
                    className="w-20"
                  />
                </div>
              )}

              {/* 时间选择 */}
              <div>
                <Label className="mb-2 block text-xs">{t("settings.syncTime")}</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={syncConfig.hour}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 0 && val <= 23) {
                        setSyncConfig((prev) => ({ ...prev, hour: val }));
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val) || val < 0) {
                        setSyncConfig((prev) => ({ ...prev, hour: 0 }));
                      } else if (val > 23) {
                        setSyncConfig((prev) => ({ ...prev, hour: 23 }));
                      }
                    }}
                    className="w-16"
                  />
                  <span className="text-sm">{t("settings.hour")}</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={syncConfig.minute}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 0 && val <= 59) {
                        setSyncConfig((prev) => ({ ...prev, minute: val }));
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val) || val < 0) {
                        setSyncConfig((prev) => ({ ...prev, minute: 0 }));
                      } else if (val > 59) {
                        setSyncConfig((prev) => ({ ...prev, minute: 59 }));
                      }
                    }}
                    className="w-16"
                  />
                  <span className="text-sm">{t("settings.minute")}</span>
                </div>
              </div>

              {/* 保存按钮 */}
              <Button size="sm" onClick={handleSaveAutoSync}>
                {t("settings.saveSyncConfig")}
              </Button>
            </div>
          )}
        </div>

        {/* Token 权限说明 */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>{t("settings.tokenPermissions")}</p>
          <a
            href="https://github.com/settings/tokens/new?scopes=read:user,repo&description=GitHubStarManager"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-foreground/80 transition-colors"
          >
            {t("settings.generateToken")}
          </a>
        </div>
      </div>
    </div>
  );
}
