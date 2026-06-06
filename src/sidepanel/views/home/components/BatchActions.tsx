import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const { t } = useTranslation();
  const [confirmUnstar, setConfirmUnstar] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="batch-actions flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg mb-3">
      <span className="batch-actions__info text-xs text-muted-foreground">
        {t("batchActions.selected")}{" "}
        <Badge variant="secondary" className="ml-1">
          {selectedCount}
        </Badge>{" "}
        {t("batchActions.selectedUnit")}
      </span>
      <div className="flex-1" />
      {!confirmUnstar ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmUnstar(true)}
          disabled={isProcessing}
          className="batch-actions__unstar text-destructive border-destructive/20 hover:bg-destructive/10"
        >
          {t("batchActions.batchUnstar")}
        </Button>
      ) : (
        <div className="batch-actions__confirm flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{t("batchActions.confirmCancel")}</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onBatchUnstar();
              setConfirmUnstar(false);
            }}
            disabled={isProcessing}
          >
            {isProcessing ? t("common.processing") : t("common.confirm")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmUnstar(false)}
            disabled={isProcessing}
          >
            {t("common.cancel")}
          </Button>
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        disabled={isProcessing}
        className="batch-actions__clear text-muted-foreground"
      >
        {t("common.clear")}
      </Button>
    </div>
  );
}
