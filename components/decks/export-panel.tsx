"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, FileJson, ChevronDown } from "lucide-react";
import { exportAsJson, exportAsCsv, exportAsPdfHtml, downloadBlob } from "@/lib/export";
import { Button } from "@/components/ui/button";
import type { Flashcard } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ExportPanelProps {
  deckTitle: string;
  cards: Flashcard[];
  className?: string;
}

const EXPORT_OPTIONS = [
  {
    key: "pdf",
    label: "PDF",
    description: "Print-friendly cards",
    icon: FileText,
    color: "#FF6B35",
  },
  {
    key: "csv",
    label: "CSV",
    description: "Anki-compatible",
    icon: FileSpreadsheet,
    color: "#00FF9F",
  },
  {
    key: "json",
    label: "JSON",
    description: "Raw data export",
    icon: FileJson,
    color: "#7B61FF",
  },
];

export function ExportPanel({ deckTitle, cards, className }: ExportPanelProps) {
  const [open, setOpen] = useState(false);

  const handleExport = (format: string) => {
    const data = { title: deckTitle, cards };

    try {
      if (format === "json") {
        const content = exportAsJson(data);
        downloadBlob(content, `${deckTitle}.json`, "application/json");
      } else if (format === "csv") {
        const content = exportAsCsv(data);
        downloadBlob(content, `${deckTitle}.csv`, "text/csv");
      } else if (format === "pdf") {
        const html = exportAsPdfHtml(data);
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(html);
          win.document.close();
        } else {
          downloadBlob(html, `${deckTitle}.html`, "text/html");
        }
      }

      toast({
        title: "Export ready",
        description: `${deckTitle} exported as ${format.toUpperCase()}`,
        variant: "success",
      });
      setOpen(false);
    } catch (err) {
      toast({ title: "Export failed", variant: "error" });
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-20 glass rounded-xl border border-dark-border shadow-card min-w-[200px] overflow-hidden animate-slide-up">
            <div className="px-3 py-2 border-b border-dark-border">
              <p className="text-xs text-gray-500 font-medium">Download {cards.length} cards as:</p>
            </div>
            {EXPORT_OPTIONS.map(({ key, label, description, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => handleExport(key)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-dark-muted transition-colors group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: color + "20" }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
