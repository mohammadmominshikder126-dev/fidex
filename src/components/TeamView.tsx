import React, { useState } from 'react';
import { Users, Copy, Check } from 'lucide-react';
import type { SiteConfig, TeamOverview } from '../types';
import { FeedexLogoImage } from './QrMatrix';

interface TeamViewProps {
  team: TeamOverview;
  siteConfig: SiteConfig;
  inviteCode: string;
  onGoInvite: () => void;
}

const LEVEL_LABELS: Record<1 | 2 | 3, string> = {
  1: '১ম লেভেল',
  2: '২য় লেভেল',
  3: '৩য় লেভেল',
};

export function TeamView({ team, siteConfig, inviteCode, onGoInvite }: TeamViewProps) {
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [copied, setCopied] = useState(false);

  const members = team.levels[selectedLevel];
  const levelRates: Record<1 | 2 | 3, string> = {
    1: `${siteConfig.referralRates.level1}% সরাসরি পার্টনার রেফার কমিশন`,
    2: `${siteConfig.referralRates.level2}% দ্বিতীয় স্তরের পার্টনার কমিশন`,
    3: `${siteConfig.referralRates.level3}% তৃতীয় স্তরের পার্টনার কমিশন`,
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard error
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#0448A2] text-white p-6 shadow-sm">
            <div className="text-center">
              <div className="inline-flex items-center bg-white px-2.5 py-1 rounded-lg mb-3">
                <FeedexLogoImage className="h-4 w-auto" />
              </div>
              <p className="text-sm font-medium text-white/90">টিম রিচার্জ</p>
              <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
                ৳ {team.teamRecharge.toFixed(0)}
              </p>
            </div>

            <div className="my-5 h-px bg-white/25" />

            <div className="grid grid-cols-2 divide-x divide-white/25 text-center">
              <div className="px-2">
                <p className="text-xs font-medium text-white/85">টিম সম্পদ</p>
                <p className="mt-1.5 text-lg font-bold tabular-nums">
                  ৳ {team.teamAssets.toFixed(0)}
                </p>
              </div>
              <div className="px-2">
                <p className="text-xs font-medium text-white/85">মোট টিম সদস্য:</p>
                <p className="mt-1.5 text-lg font-bold tabular-nums">{team.teamNumber} জন</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">আপনার রেফার কোড</p>
              <p className="mt-0.5 text-base font-bold text-slate-900 font-mono tracking-wide">
                {inviteCode}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyCode}
                className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
              <button
                type="button"
                onClick={onGoInvite}
                className="h-10 px-3.5 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-xs font-semibold whitespace-nowrap"
              >
                আমন্ত্রণ করুন
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#E2E6EC] rounded-lg overflow-hidden grid grid-cols-3">
            {([1, 2, 3] as const).map((lvl) => {
              const active = selectedLevel === lvl;
              const slantClass =
                active && lvl === 1
                  ? 'tab-slant-left'
                  : active && lvl === 2
                    ? 'tab-slant-mid'
                    : active && lvl === 3
                      ? 'tab-slant-right'
                      : '';
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`h-11 text-sm font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? `bg-[#0448A2] text-white ${slantClass}`
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {LEVEL_LABELS[lvl]}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{levelRates[selectedLevel]}</span>
            <span className="tabular-nums">{members.length} জন সদস্য</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {members.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2.5" strokeWidth={1.6} />
                <p className="text-sm font-medium text-slate-400">কোনো তথ্য নেই</p>
                <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                  আপনার রেফার কোড <span className="font-mono text-slate-600">{inviteCode}</span> শেয়ার করে {LEVEL_LABELS[selectedLevel]} টিম তৈরি করুন।
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="px-5 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 font-mono">
                        আইডি: {member.memberId}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {member.phoneMasked} · যোগদান {new Date(member.joinedAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#0448A2] tabular-nums">
                        ৳ {member.assetsTotal.toFixed(0)}
                      </p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        রিচার্জ ৳ {member.rechargeTotal.toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
