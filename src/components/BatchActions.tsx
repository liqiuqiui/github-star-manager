import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

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
    <div className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg mb-3">
      <span className="text-xs text-muted-foreground">
        已选{" "}
        <Badge variant="secondary" className="ml-1">
          {selectedCount}
        </Badge>{" "}
        个仓库
      </span>
      <div className="flex-1" />
      {!confirmUnstar ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmUnstar(true)}
          disabled={isProcessing}
          className="text-destructive border-destructive/20 hover:bg-destructive/10"
        >
          批量取消 Star
        </Button>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">确认取消？</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onBatchUnstar();
              setConfirmUnstar(false);
            }}
            disabled={isProcessing}
          >
            {isProcessing ? "处理中..." : "确认"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmUnstar(false)}
            disabled={isProcessing}
          >
            取消
          </Button>
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        disabled={isProcessing}
        className="text-muted-foreground"
      >
        清除
      </Button>
    </div>
  );
}
