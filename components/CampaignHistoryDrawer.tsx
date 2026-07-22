'use client';

import React, { useEffect, useState } from 'react';
import { History, Trash2, ArrowUpRight, FolderOpen, Clock } from 'lucide-react';
import { getSavedCampaigns, deleteSavedCampaign, SavedCampaign } from '@/lib/storage';

interface CampaignHistoryDrawerProps {
  onLoadCampaign: (campaign: SavedCampaign) => void;
}

export function CampaignHistoryDrawer({ onLoadCampaign }: CampaignHistoryDrawerProps) {
  const [campaigns, setCampaigns] = useState<SavedCampaign[]>(() => {
    return typeof window !== 'undefined' ? getSavedCampaigns() : [];
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSavedCampaign(id);
    setCampaigns(updated);
  };

  if (campaigns.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" /> أرشيف الحملات والتسجيلات السابقة ({campaigns.length}):
        </h4>
        <span className="text-[10px] text-slate-500">محفوظة محلياً</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            onClick={() => onLoadCampaign(camp)}
            className="group bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-3 rounded-xl cursor-pointer transition flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-amber-400 transition">
                  {camp.title || 'حملة بدون عنوان'}
                </span>
                <button
                  onClick={(e) => handleDelete(camp.id, e)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                {camp.sourceScript}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(camp.createdAt).toLocaleDateString('ar-MA')}
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                استرجاع <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
