import { useState, useEffect } from "react";
import { ArrowLeft, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { UIMode } from "../types";
import { useSettingsStore } from "../stores/settingsStore";
import { useTheme } from "../hooks/useTheme";
import { validateToken } from "../services/auth";
import type { GitHubUser } from "../types";

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { token, uiMode, setToken, setUIMode, loadSettings } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const [tokenInput, setTokenInput] = useState(token);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) {
      setError("请输入 Token");
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
      setError("Token 无效，请检查后重试");
      setUser(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleUIModeChange = async (mode: UIMode) => {
    await setUIMode(mode);
  };

  return (
    <div className="flex flex-col h-full min-h-[480px] min-w-[320px] w-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft size={16} />
        </Button>
        <h2 className="text-sm font-semibold text-foreground">设置</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
              {isValidating ? "验证中..." : "保存"}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
          {saved && <p className="text-xs text-green-600 mt-1.5">保存成功</p>}
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

        <div>
          <Label className="mb-2 block">UI 模式</Label>
          <div className="flex gap-2">
            {(["popup", "sidebar"] as UIMode[]).map((mode) => (
              <Button
                key={mode}
                variant={uiMode === mode ? "default" : "outline"}
                onClick={() => handleUIModeChange(mode)}
                className="flex-1"
              >
                {mode === "popup" ? "Popup 弹窗" : "侧边栏"}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">主题</Label>
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

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Token 权限：read:user, repo</p>
          <a
            href="https://github.com/settings/tokens/new?scopes=read:user,repo&description=GitHubStarManager"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-foreground/80 transition-colors"
          >
            生成 Token →
          </a>
        </div>
      </div>
    </div>
  );
}
