import { useState, useEffect } from "react";
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
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold">设置</h2>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          GitHub Personal Access Token
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSaveToken}
            disabled={isValidating}
            className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isValidating ? "验证中..." : "保存"}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {saved && <p className="text-xs text-green-500 mt-1">保存成功</p>}
        {user && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded">
            <img src={user.avatarUrl} alt={user.login} className="w-6 h-6 rounded-full" />
            <span className="text-xs text-green-700">
              {user.name} (@{user.login})
            </span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">UI 模式</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleUIModeChange("popup")}
            className={`flex-1 text-xs py-2 rounded border transition-colors ${
              uiMode === "popup"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Popup 弹窗
          </button>
          <button
            onClick={() => handleUIModeChange("sidebar")}
            className={`flex-1 text-xs py-2 rounded border transition-colors ${
              uiMode === "sidebar"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            侧边栏
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        <p className="mb-1">Token 权限：read:user, repo</p>
        <a
          href="https://github.com/settings/tokens/new?scopes=read:user,repo&description=GitHubStarManager"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          生成 Token →
        </a>
      </div>
    </div>
  );
}
