import { draftMode } from 'next/headers';
import Link from 'next/link';
import { Eye, X } from 'lucide-react';

export async function DraftPreviewBanner() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;

  return (
    <div className="bg-gradient-to-r from-[#D4AF37] via-[#C99700] to-[#E6C657] text-black px-4 py-2 text-xs font-semibold flex items-center justify-between z-50 sticky top-0 shadow-lg">
      <div className="flex items-center space-x-2">
        <Eye className="w-4 h-4 text-black animate-pulse" />
        <span>Executive Draft Preview Active • Viewing Unpublished Revision Data</span>
      </div>
      <Link
        href="/api/preview/exit"
        className="px-2.5 py-1 rounded-lg bg-black text-[#D4AF37] hover:bg-gray-900 text-[11px] font-bold transition flex items-center space-x-1 shadow-sm"
      >
        <span>Exit Preview</span>
        <X className="w-3 h-3 ml-1" />
      </Link>
    </div>
  );
}
