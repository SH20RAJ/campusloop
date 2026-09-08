"use client";

import React from "react";

export function CuteAiMascot({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Ambient Radial Glow */}
      <div className="absolute inset-0 bg-radial from-purple-500/30 to-transparent blur-xl rounded-full scale-110" />

      {/* Cute SVG Robot Scholar */}
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(168,85,247,0.35)]"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="40" y1="50" x2="120" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EDE9FE" />
            <stop offset="0.6" stopColor="#C4B5FD" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="50" y1="55" x2="110" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E1035" />
            <stop offset="1" stopColor="#2E1065" />
          </linearGradient>
          <linearGradient id="glowEye" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#F472B6" />
            <stop offset="1" stopColor="#C084FC" />
          </linearGradient>
          <linearGradient id="bookCover" x1="45" y1="105" x2="115" y2="145" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4338CA" />
            <stop offset="1" stopColor="#312E81" />
          </linearGradient>
          <linearGradient id="bookPages" x1="50" y1="110" x2="110" y2="135" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="tasselGrad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#FBBF24" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Robot Torso / Base */}
        <ellipse cx="80" cy="118" rx="34" ry="22" fill="url(#bodyGrad)" />
        <ellipse cx="80" cy="120" rx="26" ry="15" fill="#7C3AED" opacity="0.4" />

        {/* Robot Head (Rounded Capsule) */}
        <rect x="42" y="44" width="76" height="58" rx="28" fill="url(#bodyGrad)" />

        {/* Head Side Antennas / Ears */}
        <rect x="35" y="62" width="7" height="18" rx="3.5" fill="#A78BFA" />
        <rect x="118" y="62" width="7" height="18" rx="3.5" fill="#A78BFA" />

        {/* Dark Screen Face */}
        <rect x="50" y="52" width="60" height="42" rx="18" fill="url(#screenGrad)" stroke="#A78BFA" strokeWidth="1.5" />

        {/* Expressive Glowing Eyes */}
        <ellipse cx="66" cy="72" rx="6" ry="7.5" fill="url(#glowEye)" />
        <ellipse cx="94" cy="72" rx="6" ry="7.5" fill="url(#glowEye)" />
        <circle cx="68" cy="69" r="2.2" fill="#FFFFFF" />
        <circle cx="96" cy="69" r="2.2" fill="#FFFFFF" />

        {/* Cute Blushing Cheeks */}
        <ellipse cx="58" cy="82" rx="4.5" ry="2" fill="#F472B6" opacity="0.6" />
        <ellipse cx="102" cy="82" rx="4.5" ry="2" fill="#F472B6" opacity="0.6" />

        {/* Cute Smiling Mouth */}
        <path d="M76 80 Q80 84 84 80" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Graduation Cap (Mortarboard) */}
        {/* Cap Skull Base */}
        <path d="M60 44 Q80 39 100 44 L98 48 Q80 43 62 48 Z" fill="#18181B" />
        {/* Diamond Board */}
        <polygon points="80,18 126,32 80,46 34,32" fill="#09090B" stroke="#27272A" strokeWidth="1.5" />
        <polygon points="80,21 121,32 80,43 39,32" fill="#18181B" />
        {/* Center Button */}
        <circle cx="80" cy="32" r="3.5" fill="url(#tasselGrad)" />
        {/* Tassel */}
        <path d="M80 32 Q108 34 116 48 L114 62" stroke="url(#tasselGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="114" cy="63" r="3" fill="#F59E0B" />

        {/* Open Book in Hands */}
        {/* Left Page & Right Page */}
        <path d="M46 122 Q63 118 80 123 Q97 118 114 122 L116 138 Q97 134 80 139 Q63 134 44 138 Z" fill="url(#bookCover)" />
        <path d="M48 120 Q64 116 80 120 Q96 116 112 120 L110 134 Q96 130 80 134 Q64 130 50 134 Z" fill="url(#bookPages)" />
        {/* Center Book Seam */}
        <line x1="80" y1="120" x2="80" y2="135" stroke="#CBD5E1" strokeWidth="1.5" />
        {/* Page text lines */}
        <line x1="56" y1="124" x2="74" y2="123" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
        <line x1="56" y1="128" x2="72" y2="127" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
        <line x1="86" y1="123" x2="104" y2="124" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
        <line x1="88" y1="127" x2="104" y2="128" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />

        {/* Little Robot Hands holding book */}
        <circle cx="50" cy="126" r="5" fill="#DDD6FE" />
        <circle cx="110" cy="126" r="5" fill="#DDD6FE" />
      </svg>
    </div>
  );
}
