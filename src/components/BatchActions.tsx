import { useState } from "react";

interface BatchActionsProps {
  selectedCount: number;
  onBatchUnstar: () => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}

export function BatchActions({
  selectedCount,
  onBatchUnstar,
  onClearSelection,
  isProcessing,
}: BatchActionsProps) {
  const [confirmUnstar, setConfirmUnstar] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg mb-3">
      <span className="text-xs text-blue-700">已选 {selectedCount} 个仓库</span>
      <div className="flex-1" />
      {!confirmUnstar ? (
        <button
          onClick={() => setConfirmUnstar(true)}
          disabled={isProcessing}
          className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          批量取消 Star
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-xs text-red-600">确认取消？</span>
          <button
            onClick={() => {
              onBatchUnstar();
              setConfirmUnstar(false);
            }}
            disabled={isProcessing}
            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isProcessing ? "处理中..." : "确认"}
          </button>
          <button
            onClick={() => setConfirmUnstar(false)}
            disabled={isProcessing}
            className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            取消
          </button>
        </div>
      )}
      <button
        onClick={onClearSelection}
        disabled={isProcessing}
        className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
      >
        清除选择
      </button>
    </div>
  );
}
