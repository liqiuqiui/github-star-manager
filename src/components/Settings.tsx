import { useState, useEffect } from "react";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import clsx from "clsx";
import type { UIMode } from "../types";
import { useSettingsStore } from "../stores/settingsStore";
import { validateToken } from "../services/auth";
import type { GitHubUser } from "../types";

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { token, uiMode, setToken, setUIMode, loadSettings } = useSettingsStore();
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
      <header className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
        <button
          onClick={onBack}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-sm font-semibold text-gray-800">设置</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            GitHub Personal Access Token
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-xs bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
            />
            <button
              onClick={handleSaveToken}
              disabled={isValidating}
              className="px-4 py-2 bg-gray-800 text-white text-xs rounded-md hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {isValidating ? "验证中..." : "保存"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          {saved && <p className="text-xs text-green-600 mt-1.5">保存成功</p>}
          {user && (
            <div className="flex items-center gap-2 mt-2 p-2.5 bg-gray-50 border border-gray-100 rounded-lg">
              <img src={user.avatarUrl} alt={user.login} className="w-7 h-7 rounded-full" />
              <div>
                <span className="text-xs text-gray-700 font-medium">{user.name}</span>
                <span className="text-xs text-gray-400 ml-1">@{user.login}</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">UI 模式</label>
          <div className="flex gap-2">
            {(["popup", "sidebar"] as UIMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleUIModeChange(mode)}
                className={clsx(
                  "flex-1 text-xs py-2.5 rounded-lg border transition-colors",
                  uiMode === mode
                    ? "border-gray-800 bg-gray-800 text-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50",
                )}
              >
                {mode === "popup" ? "Popup 弹窗" : "侧边栏"}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p>Token 权限：read:user, repo</p>
          <a
            href="https://github.com/settings/tokens/new?scopes=read:user,repo&description=GitHubStarManager"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            生成 Token →
          </a>
        </div>
      </div>
    </div>
  );
}
