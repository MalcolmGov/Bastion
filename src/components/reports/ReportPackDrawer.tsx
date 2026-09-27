'use client';

import React, { useState, useEffect } from 'react';
import { Download, Trash2, X, FileText, BookmarkPlus } from 'lucide-react';
import { ReportItem } from '@/lib/types';

interface ReportPackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  allReports: ReportItem[];
}

export const ReportPackDrawer: React.FC<ReportPackDrawerProps> = ({
  isOpen,
  onClose,
  allReports,
}) => {
  const [packIds, setPackIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gf_report_pack');
      if (stored) {
        setPackIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const savePack = (ids: string[]) => {
    setPackIds(ids);
    try {
      localStorage.setItem('gf_report_pack', JSON.stringify(ids));
    } catch (e) {
      console.error(e);
    }
  };

  const removeReport = (id: string) => {
    savePack(packIds.filter((item) => item !== id));
  };

  const clearPack = () => {
    savePack([]);
  };

  const selectedReports = allReports.filter((r) => packIds.includes(r.id));

  const downloadIndex = () => {
    if (selectedReports.length === 0) return;

    const contentLines = [
      `=============================================================`,
      `GOLD FIELDS LIMITED — MY REPORT PACK SHORTLIST`,
      `Generated: ${new Date().toUTCString()}`,
      `Scope: Selected published corporate & financial documents`,
      `Concept Prototype Index (https://zaraai.digital / goldfields)`,
      `=============================================================\n`,
      ...selectedReports.map((r, i) => {
        return (
          `[${i + 1}] ${r.title}\n` +
          `    Period: ${r.period} (${r.year})\n` +
          `    Category: ${r.category}\n` +
          `    Format & Size: ${r.fileFormat} • ${r.fileSize}\n` +
          `    Official Document Link: ${r.downloadUrl}\n` +
          `    Summary: ${r.summary}\n`
        );
      }),
      `\n-------------------------------------------------------------`,
      `End of Report Pack Index. For live filings, visit: https://www.goldfields.com/`,
      `-------------------------------------------------------------`
    ];

    const blob = new Blob([contentLines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gold_Fields_Report_Pack_Index_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-dark/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white shadow-elevated flex flex-col z-10 border-l border-mist animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-editorial border-b border-mist flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-gold-dark" />
            <div>
              <h3 className="font-bold text-sm text-navy">My Report Pack</h3>
              <p className="text-[11px] text-ink-muted">
                {selectedReports.length} {selectedReports.length === 1 ? 'document' : 'documents'} queued
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-ink-muted hover:text-ink hover:bg-mist transition-colors"
            aria-label="Close report pack"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative notice */}
        <div className="bg-mist-light/50 px-4 py-2 border-b border-mist text-[11px] text-ink-muted">
          Shortlist disclosures and download a synthesized text index of titles and official direct links.
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedReports.length === 0 ? (
            <div className="py-16 text-center text-xs text-ink-muted">
              <FileText className="w-10 h-10 mx-auto text-ink-subtle mb-3 stroke-1" />
              <p className="font-semibold text-ink text-sm mb-1">Your report pack is empty</p>
              <p className="max-w-xs mx-auto">
                Click &quot;+ Add to Pack&quot; on any report in the Investor or Report library to queue it here.
              </p>
            </div>
          ) : (
            selectedReports.map((report) => (
              <div
                key={report.id}
                className="p-3 rounded-lg border border-mist bg-white shadow-subtle flex items-start justify-between gap-3 group"
              >
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block mb-0.5">
                    {report.category} • {report.period}
                  </span>
                  <h4 className="text-xs font-bold text-ink group-hover:text-navy">
                    {report.title}
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-1">
                    {report.fileFormat} • {report.fileSize}
                  </p>
                </div>

                <button
                  onClick={() => removeReport(report.id)}
                  className="p-1.5 rounded text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove from pack"
                  aria-label={`Remove ${report.title} from pack`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {selectedReports.length > 0 && (
          <div className="p-4 border-t border-mist bg-editorial space-y-2">
            <button
              onClick={downloadIndex}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold shadow-subtle transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Link & Summary Index (.txt)</span>
            </button>
            <div className="flex justify-between items-center px-1 pt-1">
              <button
                onClick={clearPack}
                className="text-[11px] text-ink-muted hover:text-red-600 transition-colors"
              >
                Clear all items
              </button>
              <span className="text-[10px] text-ink-subtle">
                Deterministic local client export
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
