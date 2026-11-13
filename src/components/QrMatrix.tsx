import React, { useMemo, useState } from 'react';
import { Globe } from 'lucide-react';

export const COMMUNITY_LINKS = {
  telegramChannel: 'https://t.me/FeedexDigitalOfficial',
  supportCenter: 'https://t.me/FeedexDigitalSupport',
};

export function FeedexLogoImage({
  className = 'h-7 w-auto',
}: {
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="font-bold text-[#4D148C] tracking-tight">
        FeedexDigital
      </span>
    );
  }

  return (
    <img
      src="/assets/aistudio/images__4__6532fc09.png"
      alt="FeedexDigital লোগো"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export function SafeImage({
  src,
  alt,
  className,
  fallbackTitle,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#4D148C] to-[#0448A2] text-white ${className || ''}`}
      >
        <Globe className="w-7 h-7 opacity-80" />
        {fallbackTitle && (
          <span className="mt-1 text-[11px] font-medium opacity-85 px-2 text-center">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export function QrMatrix({ value, size = 148 }: { value: string; size?: number }) {
  const grid = useMemo(() => {
    const dim = 21;
    const matrix: boolean[][] = Array.from({ length: dim }, () => Array(dim).fill(false));

    const drawFinder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const border = r === 0 || r === 6 || c === 0 || c === 6;
          const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[r0 + r][c0 + c] = border || center;
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, dim - 7);
    drawFinder(dim - 7, 0);

    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= dim - 8;
        const inBottomLeft = r >= dim - 8 && c < 8;
        if (inTopLeft || inTopRight || inBottomLeft) continue;
        hash ^= (r * 31 + c * 17) & 0xff;
        hash = Math.imul(hash, 16777619);
        matrix[r][c] = (hash >>> 0) % 2 === 0;
      }
    }
    return matrix;
  }, [value]);

  const cell = size / 21;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="bg-white p-2 rounded-xl border border-slate-200"
      role="img"
      aria-label={`QR কোড: ${value}`}
    >
      {grid.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell + 0.15}
              height={cell + 0.15}
              fill="#0F172A"
            />
          ) : null
        )
      )}
    </svg>
  );
}
