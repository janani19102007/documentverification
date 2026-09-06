"use client";

import { memo } from "react";

export const DOC_VIEWBOX_W = 560;
export const DOC_VIEWBOX_H = 360;

/**
 * Synthetic passport-replica document rendered as inline SVG.
 * Used as a stand-in for a captured document image so bounding
 * boxes can be overlaid in the same coordinate space.
 */
export const SyntheticPassport = memo(function SyntheticPassport() {
  return (
    <svg
      viewBox={`0 0 ${DOC_VIEWBOX_W} ${DOC_VIEWBOX_H}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Synthetic passport document image"
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="cover-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#173a63" />
          <stop offset="1" stopColor="#10304f" />
        </linearGradient>
        <pattern
          id="guilloche"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 15 Q7.5 0 15 15 T30 15"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      {/* Page background */}
      <rect width="560" height="360" rx="8" fill="#f7f7f4" />
      {/* Cover band */}
      <rect width="560" height="88" fill="url(#cover-bg)" />
      <rect width="560" height="88" fill="url(#guilloche)" />

      {/* Country header */}
      <text x="280" y="36" textAnchor="middle" fill="#c9d4e8" fontSize="11" letterSpacing="4" fontFamily="sans-serif">
        UNITED STATES OF AMERICA
      </text>
      <text x="280" y="56" textAnchor="middle" fill="#ffffff" fontSize="15" letterSpacing="6" fontWeight="700" fontFamily="sans-serif">
        PASSPORT
      </text>
      <text x="280" y="72" textAnchor="middle" fill="#8fb0d6" fontSize="8" letterSpacing="3" fontFamily="sans-serif">
        PASSPORT • PASSEPORT • PÄSS • LÄISSEPASS
      </text>

      {/* Emblem */}
      <g transform="translate(28,42)">
        <circle r="16" fill="none" stroke="#f2c63b" strokeWidth="2" />
        <path
          d="M0 -11 L4 -4 L12 -4 L6 1 L8 9 L0 5 L-8 9 L-6 1 L-12 -4 L-4 -4 Z"
          fill="#f2c63b"
        />
      </g>

      {/* MRZ-style decorative band */}
      <rect x="0" y="332" width="560" height="28" fill="#223a56" />

      {/* Photo placeholder */}
      <rect x="352" y="104" width="96" height="112" fill="#e8e4dc" stroke="#cfc9bd" strokeWidth="1" />
      <text x="400" y="162" textAnchor="middle" fill="#9a9488" fontSize="9" fontFamily="sans-serif">
        PHOTO
      </text>
      {/* Face silhouette */}
      <circle cx="400" cy="148" r="17" fill="#d9d2c6" />
      <path d="M376 216 Q388 205 400 216 Q412 205 424 216 Z" fill="#d9d2c6" />

      {/* Photo ghost-shield overlay (tampering) */}
      <rect x="352" y="104" width="96" height="112" fill="none" stroke="#b8a99a" strokeWidth="2" strokeDasharray="6 4" />

      {/* Field labels + values */}
      <g fontFamily="sans-serif">
        <text x="30" y="136" fill="#5b6472" fontSize="8" letterSpacing="1">TYPE</text>
        <text x="40" y="122" fill="#1a1a1a" fontSize="12" fontWeight="600">P</text>
        <text x="86" y="136" fill="#5b6472" fontSize="8" letterSpacing="1">CODE</text>
        <text x="98" y="122" fill="#1a1a1a" fontSize="12" fontWeight="600">USA</text>

        <text x="30" y="176" fill="#5b6472" fontSize="8" letterSpacing="1">SURNAME</text>
        <text x="32" y="194" fill="#1a1a1a" fontSize="14" fontWeight="600" letterSpacing="1">DOE</text>

        <text x="30" y="224" fill="#5b6472" fontSize="8" letterSpacing="1">GIVEN NAMES</text>
        <text x="32" y="242" fill="#1a1a1a" fontSize="14" fontWeight="600" letterSpacing="1">JOHN</text>

        <text x="30" y="272" fill="#5b6472" fontSize="8" letterSpacing="1">NATIONALITY</text>
        <text x="32" y="290" fill="#1a1a1a" fontSize="12" fontWeight="600">USA</text>
        <text x="122" y="272" fill="#5b6472" fontSize="8" letterSpacing="1">SEX</text>
        <text x="122" y="290" fill="#1a1a1a" fontSize="12" fontWeight="600">M</text>
        <text x="176" y="272" fill="#5b6472" fontSize="8" letterSpacing="1">DOB</text>
        <text x="176" y="290" fill="#c0392b" fontSize="12" fontWeight="700">12 APR 1988</text>
        <text x="286" y="272" fill="#5b6472" fontSize="8" letterSpacing="1">EXP</text>
        <text x="286" y="290" fill="#c0392b" fontSize="12" fontWeight="700">11 MAY 2028</text>

        {/* Document number */}
        <text x="30" y="318" fill="#5b6472" fontSize="8" letterSpacing="1">DOCUMENT NO</text>
        <text x="32" y="310" fill="#1a1a1a" fontSize="11" fontWeight="600" letterSpacing="2">XH3849201</text>
      </g>

      {/* MRZ line */}
      <g fontFamily="monospace" fontSize="15" fontWeight="600" letterSpacing="2">
        <text x="16" y="352" fill="#1a1a1a">P&lt;USADOE&lt;&lt;JOHN&lt;XH3849201</text>
      </g>

      {/* Hologram sheen circle */}
      <ellipse cx="520" cy="196" rx="26" ry="34" fill="none" stroke="#a7c7e8" strokeWidth="1.5" />
      <ellipse cx="520" cy="196" rx="16" ry="22" fill="none" stroke="#a7c7e8" strokeWidth="1" />
    </svg>
  );
});