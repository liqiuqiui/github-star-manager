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
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg mb-3">
      <span className="text-xs text-gray-600">
        已选 <span className="font-medium text-gray-800">{selectedCount}</span> 个仓库
      </span>
      <div className="flex-1" />
      {!confirmUnstar ? (
        <button
          onClick={() => setConfirmUnstar(true)}
          disabled={isProcessing}
          className="text-xs px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-40 transition-colors"
        >
          批量取消 Star
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">确认取消？</span>
          <button
            onClick={() => {
              onBatchUnstar();
              setConfirmUnstar(false);
            }}
            disabled={isProcessing}
            className="text-xs px-2.5 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            {isProcessing ? "处理中..." : "确认"}
          </button>
          <button
            onClick={() => setConfirmUnstar(false)}
            disabled={isProcessing}
            className="text-xs px-2.5 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      )}
      <button
        onClick={onClearSelection}
        disabled={isProcessing}
        className="text-xs px-2 py-1.5 text-gray-400 hover:text-gray-600 transition-colors"
      >
        清除
      </button>
    </div>
  );
}
