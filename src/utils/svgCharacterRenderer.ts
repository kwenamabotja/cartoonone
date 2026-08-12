// Utility to generate high-resolution SVG data URLs for all cartoon character styles
import { CharacterStyle, ExpressionType } from '../types';

export function getCharacterSvgDataUrl(
  style: CharacterStyle,
  color: string = '#3b82f6',
  emotion: ExpressionType = 'happy',
  isSpeaking: boolean = false
): string {
  const isSurprised = emotion === 'surprised';
  const isConfused = emotion === 'confused';
  const isThinking = emotion === 'thinking';
  const isLaughing = emotion === 'laughing' || emotion === 'celebrating';

  let innerSvg = '';

  if (style === 'robot') {
    innerSvg = `
      <line x1="100" y1="32" x2="100" y2="12" stroke="#64748b" stroke-width="5" />
      <circle cx="100" cy="10" r="8" fill="${isSpeaking ? '#ef4444' : '#10b981'}" />
      <g fill="#0f172a">
        <rect x="62" y="174" width="28" height="14" rx="6" />
        <rect x="110" y="174" width="28" height="14" rx="6" />
        <circle cx="70" cy="181" r="3" fill="#64748b" />
        <circle cx="118" cy="181" r="3" fill="#64748b" />
      </g>
      <rect x="70" y="152" width="12" height="24" fill="#64748b" stroke="#0f172a" stroke-width="3" />
      <rect x="118" y="152" width="12" height="24" fill="#64748b" stroke="#0f172a" stroke-width="3" />
      <rect x="52" y="108" width="96" height="52" rx="14" fill="#475569" stroke="#0f172a" stroke-width="4" />
      <rect x="72" y="118" width="56" height="32" rx="8" fill="#0f172a" />
      <circle cx="84" cy="134" r="5" fill="#38bdf8" />
      <circle cx="100" cy="134" r="5" fill="#f59e0b" />
      <circle cx="116" cy="134" r="5" fill="#10b981" />
      <rect x="48" y="32" width="104" height="76" rx="18" fill="${color}" stroke="#0f172a" stroke-width="5" />
      <rect x="60" y="44" width="80" height="42" rx="10" fill="#0f172a" />
      <g fill="#38bdf8">
        <rect x="74" y="58" width="14" height="14" rx="3" />
        <rect x="112" y="58" width="14" height="14" rx="3" />
      </g>
      ${isSpeaking ? `<rect x="78" y="92" width="44" height="8" rx="4" fill="#ef4444" />` : `<line x1="80" y1="96" x2="120" y2="96" stroke="#10b981" stroke-width="4" stroke-linecap="round" />`}
    `;
  } else if (style === 'wizard') {
    innerSvg = `
      <g fill="#4c1d95">
        <path d="M62 180 L 80 180 L 84 188 L 56 188 Z" />
        <path d="M120 180 L 138 180 L 144 188 L 116 188 Z" />
      </g>
      <path d="M48 118 L 152 118 L 170 182 L 30 182 Z" fill="${color}" />
      <path d="M100 118 L 100 182" stroke="#f59e0b" stroke-width="4" />
      <line x1="145" y1="130" x2="182" y2="90" stroke="#78350f" stroke-width="5" stroke-linecap="round" />
      <polygon points="182,82 186,92 196,92 188,98 191,108 182,102 173,108 176,98 168,92 178,92" fill="#f59e0b" />
      <circle cx="100" cy="85" r="38" fill="#fed7aa" />
      <path d="M65 92 Q 100 158 135 92 Q 100 112 65 92 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
      <path d="M35 80 L 165 80 Q 100 74 100 80 Z" fill="#7c3aed" />
      <path d="M55 80 L 100 10 L 145 80 Z" fill="#5b21b6" />
      <rect x="85" y="72" width="30" height="10" fill="#f59e0b" rx="2" />
      <g fill="#0f172a">
        <circle cx="83" cy="80" r="5" />
        <circle cx="117" cy="80" r="5" />
      </g>
      ${isSpeaking ? `<ellipse cx="100" cy="96" rx="8" ry="6" fill="#ef4444" />` : `<path d="M92 96 Q 100 102 108 96" stroke="#0f172a" stroke-width="3" fill="none" />`}
    `;
  } else if (style === 'cat') {
    innerSvg = `
      <ellipse cx="100" cy="140" rx="48" ry="40" fill="${color}" />
      <path d="M48 35 L 25 80 L 62 65 Z" fill="#f472b6" stroke="#0f172a" stroke-width="3" />
      <path d="M152 35 L 175 80 L 138 65 Z" fill="#f472b6" stroke="#0f172a" stroke-width="3" />
      <circle cx="100" cy="72" r="44" fill="${color}" />
      <polygon points="100,74 93,68 107,68" fill="#f472b6" />
      <g stroke="#0f172a" stroke-width="2.5" stroke-linecap="round">
        <line x1="52" y1="72" x2="25" y2="68" />
        <line x1="52" y1="78" x2="22" y2="80" />
        <line x1="148" y1="72" x2="175" y2="68" />
        <line x1="148" y1="78" x2="178" y2="80" />
      </g>
      <g fill="#0f172a">
        <ellipse cx="80" cy="62" rx="6" ry="8" />
        <ellipse cx="120" cy="62" rx="6" ry="8" />
        <circle cx="82" cy="60" r="2" fill="#fff" />
        <circle cx="122" cy="60" r="2" fill="#fff" />
      </g>
      ${isSpeaking ? `<path d="M90 82 Q 100 98 110 82 Z" fill="#ef4444" stroke="#0f172a" stroke-width="2" />` : `<path d="M92 80 Q 100 88 108 80" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round" />`}
    `;
  } else if (style === 'presenter_female' || style === 'student') {
    innerSvg = `
      <rect x="52" y="112" width="96" height="70" rx="16" fill="#312e81" />
      <path d="M78 112 L 100 142 L 122 112 Z" fill="#ffffff" />
      <path d="M42 42 C 22 80, 25 120, 48 135" stroke="#1e1b4b" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M158 42 C 178 80, 175 120, 152 135" stroke="#1e1b4b" stroke-width="16" fill="none" stroke-linecap="round" />
      <circle cx="100" cy="72" r="38" fill="#fde047" />
      <path d="M62 58 C 65 30, 135 30, 138 58 Z" fill="#1e1b4b" />
      <g fill="#0f172a">
        <circle cx="83" cy="70" r="5" />
        <circle cx="117" cy="70" r="5" />
      </g>
      ${isSpeaking ? `<ellipse cx="100" cy="88" rx="8" ry="6" fill="#e11d48" />` : `<path d="M92 88 Q 100 94 108 88" stroke="#e11d48" stroke-width="3" fill="none" stroke-linecap="round" />`}
    `;
  } else if (style === 'presenter_male' || style === 'instructor' || style === 'engineer') {
    innerSvg = `
      <rect x="52" y="112" width="96" height="70" rx="14" fill="#0f172a" />
      <polygon points="100,112 92,160 108,160" fill="#dc2626" />
      <polygon points="82,112 100,132 118,112" fill="#ffffff" />
      <circle cx="100" cy="70" r="38" fill="#fde047" />
      <path d="M60 52 Q 100 32 140 52 L 136 38 Q 100 24 64 38 Z" fill="#451a03" />
      <g fill="#0f172a">
        <circle cx="83" cy="68" r="5" />
        <circle cx="117" cy="68" r="5" />
      </g>
      ${isSpeaking ? `<ellipse cx="100" cy="86" rx="9" ry="6" fill="#991b1b" />` : `<path d="M90 86 Q 100 92 110 86" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round" />`}
    `;
  } else if (style === 'astronaut') {
    innerSvg = `
      <rect x="56" y="110" width="88" height="70" rx="16" fill="#f8fafc" stroke="#0f172a" stroke-width="4" />
      <rect x="80" y="125" width="40" height="28" rx="6" fill="#2563eb" />
      <circle cx="100" cy="70" r="44" fill="#cbd5e1" stroke="#0f172a" stroke-width="4" />
      <rect x="68" y="48" width="64" height="42" rx="16" fill="#38bdf8" stroke="#0284c7" stroke-width="3" />
      <ellipse cx="85" cy="60" rx="8" ry="12" fill="#ffffff" opacity="0.6" />
      ${isSpeaking ? `<ellipse cx="100" cy="72" rx="8" ry="5" fill="#0f172a" />` : `<path d="M92 72 Q 100 78 108 72" stroke="#0f172a" stroke-width="3" fill="none" />`}
    `;
  } else if (style === 'alien') {
    innerSvg = `
      <ellipse cx="100" cy="140" rx="46" ry="38" fill="#a855f7" />
      <line x1="82" y1="36" x2="72" y2="15" stroke="#22c55e" stroke-width="4" />
      <circle cx="72" cy="12" r="6" fill="#f59e0b" />
      <line x1="118" y1="36" x2="128" y2="15" stroke="#22c55e" stroke-width="4" />
      <circle cx="128" cy="12" r="6" fill="#f59e0b" />
      <circle cx="100" cy="70" r="42" fill="#22c55e" />
      <circle cx="100" cy="52" r="12" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <circle cx="100" cy="52" r="5" fill="#0f172a" />
      <circle cx="76" cy="70" r="9" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <circle cx="76" cy="70" r="4" fill="#0f172a" />
      <circle cx="124" cy="70" r="9" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <circle cx="124" cy="70" r="4" fill="#0f172a" />
      ${isSpeaking ? `<ellipse cx="100" cy="88" rx="10" ry="7" fill="#0f172a" />` : `<path d="M90 88 Q 100 94 110 88" stroke="#0f172a" stroke-width="3" fill="none" />`}
    `;
  } else if (style === 'bluey') {
    innerSvg = `
      <rect x="52" y="105" width="96" height="70" rx="16" fill="#3b82f6" stroke="#1e3a8a" stroke-width="4" />
      <ellipse cx="100" cy="142" rx="28" ry="22" fill="#fef08a" />
      <path d="M48 48 L 28 10 L 72 32 Z" fill="#1e3a8a" stroke="#1d4ed8" stroke-width="3" />
      <path d="M52 46 L 38 22 L 66 36 Z" fill="#fef08a" />
      <path d="M152 48 L 172 10 L 128 32 Z" fill="#1e3a8a" stroke="#1d4ed8" stroke-width="3" />
      <path d="M148 46 L 162 22 L 134 36 Z" fill="#fef08a" />
      <rect x="46" y="28" width="108" height="85" rx="22" fill="#60a5fa" stroke="#1e3a8a" stroke-width="4" />
      <path d="M46 38 Q 78 30 92 68 Q 62 88 46 62 Z" fill="#1e3a8a" />
      <rect x="68" y="66" width="64" height="40" rx="18" fill="#fef08a" stroke="#1e3a8a" stroke-width="2.5" />
      <ellipse cx="100" cy="74" rx="10" ry="7" fill="#0f172a" />
      <g fill="#0f172a">
        <circle cx="78" cy="54" r="8" />
        <circle cx="122" cy="54" r="8" />
        <circle cx="80" cy="52" r="3" fill="#ffffff" />
        <circle cx="124" cy="52" r="3" fill="#ffffff" />
      </g>
      ${isSpeaking ? `<path d="M84 88 Q 100 108 116 88 Z" fill="#ef4444" stroke="#0f172a" stroke-width="2.5" />` : `<path d="M88 88 Q 100 96 112 88" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round" />`}
    `;
  } else if (style === 'sponge_pop') {
    innerSvg = `
      <rect x="52" y="132" width="96" height="38" fill="#78350f" stroke="#0f172a" stroke-width="4" />
      <rect x="52" y="132" width="96" height="12" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <polygon points="100,132 105,145 100,158 95,145" fill="#dc2626" />
      <rect x="48" y="24" width="104" height="110" rx="12" fill="#facc15" stroke="#0f172a" stroke-width="4" />
      <circle cx="58" cy="36" r="6" fill="#eab308" opacity="0.6" />
      <circle cx="140" cy="40" r="8" fill="#eab308" opacity="0.6" />
      <circle cx="76" cy="62" r="18" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      <circle cx="124" cy="62" r="18" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      <circle cx="78" cy="62" r="9" fill="#0284c7" />
      <circle cx="122" cy="62" r="9" fill="#0284c7" />
      <path d="M100 62 Q 112 70 100 78" stroke="#0f172a" stroke-width="3.5" fill="none" />
      <rect x="92" y="90" width="7" height="9" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
      <rect x="101" y="90" width="7" height="9" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
      ${isSpeaking ? `<path d="M72 88 Q 100 118 128 88 Z" fill="#dc2626" stroke="#0f172a" stroke-width="3" />` : `<path d="M68 88 Q 100 106 132 88" stroke="#0f172a" stroke-width="3.5" fill="none" />`}
    `;
  } else if (style === 'star_pat') {
    innerSvg = `
      <path d="M52 142 L 148 142 L 160 185 L 40 185 Z" fill="#84cc16" stroke="#0f172a" stroke-width="4" />
      <path d="M100 12 L 132 68 L 180 115 L 135 142 L 148 185 L 100 162 L 52 185 L 65 142 L 20 115 L 68 68 Z" fill="#f472b6" stroke="#0f172a" stroke-width="4" />
      <circle cx="85" cy="72" r="9" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
      <circle cx="115" cy="72" r="9" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
      <circle cx="86" cy="72" r="4" fill="#0f172a" />
      <circle cx="114" cy="72" r="4" fill="#0f172a" />
      ${isSpeaking ? `<ellipse cx="100" cy="98" rx="14" ry="12" fill="#be123c" />` : `<path d="M85 92 Q 100 108 115 92" stroke="#0f172a" stroke-width="3.5" fill="none" />`}
    `;
  } else if (style === 'squid_ward') {
    innerSvg = `
      <path d="M48 135 L 152 135 L 165 185 L 35 185 Z" fill="#78350f" stroke="#0f172a" stroke-width="4" />
      <ellipse cx="100" cy="75" rx="48" ry="55" fill="#2dd4bf" stroke="#0d9488" stroke-width="4" />
      <ellipse cx="78" cy="62" rx="14" ry="16" fill="#fef08a" stroke="#0f172a" stroke-width="3" />
      <ellipse cx="122" cy="62" rx="14" ry="16" fill="#fef08a" stroke="#0f172a" stroke-width="3" />
      <rect x="76" y="60" width="4" height="6" fill="#9f1239" />
      <rect x="120" y="60" width="4" height="6" fill="#9f1239" />
      <path d="M90 70 Q 100 120 110 112 Q 100 115 90 70 Z" fill="#0d9488" stroke="#0f172a" stroke-width="3" />
      ${isSpeaking ? `<ellipse cx="100" cy="118" rx="12" ry="8" fill="#0f172a" />` : `<path d="M85 116 Q 100 110 115 116" stroke="#0f172a" stroke-width="3.5" fill="none" />`}
    `;
  } else if (style === 'loud_house') {
    innerSvg = `
      <rect x="68" y="165" width="64" height="22" fill="#1d4ed8" stroke="#0f172a" stroke-width="3" />
      <path d="M42 125 L 158 125 L 165 168 L 35 168 Z" fill="#f97316" stroke="#0f172a" stroke-width="4" />
      <circle cx="100" cy="72" r="38" fill="#fed7aa" stroke="#0f172a" stroke-width="4" />
      <path d="M58 55 Q 50 20 80 25 Q 95 10 115 20 Q 135 15 142 45 Q 150 65 138 68 Q 115 35 58 55 Z" fill="#f8fafc" stroke="#0f172a" stroke-width="4" />
      <circle cx="82" cy="66" r="7" fill="#0f172a" />
      <circle cx="118" cy="66" r="7" fill="#0f172a" />
      <rect x="97" y="86" width="6" height="5" fill="#ffffff" stroke="#0f172a" stroke-width="1" />
      ${isSpeaking ? `<path d="M82 84 Q 100 106 118 84 Z" fill="#ef4444" />` : `<path d="M82 85 Q 100 96 118 85" stroke="#0f172a" stroke-width="3.5" fill="none" />`}
    `;
  } else if (style === 'loud_sister') {
    innerSvg = `
      <path d="M40 128 L 160 128 L 168 185 L 32 185 Z" fill="#06b6d4" stroke="#0f172a" stroke-width="4" />
      <path d="M42 68 Q 30 15 100 12 Q 170 15 158 68 Z" fill="#fde047" stroke="#0f172a" stroke-width="4" />
      <ellipse cx="100" cy="72" rx="34" ry="38" fill="#fed7aa" stroke="#0f172a" stroke-width="4" />
      <circle cx="82" cy="68" r="6" fill="#0f172a" />
      <circle cx="118" cy="68" r="6" fill="#0f172a" />
      ${isSpeaking ? `<path d="M84 88 Q 100 108 116 88 Z" fill="#ec4899" />` : `<path d="M86 88 Q 100 96 114 88" stroke="#ec4899" stroke-width="3.5" fill="none" />`}
    `;
  } else if (style === 'blue_monster') {
    innerSvg = `
      <ellipse cx="100" cy="120" rx="65" ry="60" fill="#2563eb" stroke="#1d4ed8" stroke-width="5" />
      <circle cx="76" cy="48" r="18" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      <circle cx="124" cy="48" r="18" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      <circle cx="72" cy="44" r="7" fill="#0f172a" />
      <circle cx="128" cy="52" r="7" fill="#0f172a" />
      <path d="M52 82 Q 100 135 148 82 Z" fill="#0f172a" />
    `;
  } else if (style === 'pink_panther') {
    innerSvg = `
      <ellipse cx="100" cy="148" rx="36" ry="42" fill="#f472b6" stroke="#be123c" stroke-width="3" />
      <ellipse cx="100" cy="70" rx="38" ry="42" fill="#f472b6" stroke="#be123c" stroke-width="3" />
      <ellipse cx="100" cy="82" rx="24" ry="16" fill="#fbcfe8" />
      <polygon points="100,75 92,82 108,82" fill="#be123c" />
      <ellipse cx="78" cy="62" rx="10" ry="8" fill="#facc15" stroke="#0f172a" stroke-width="2" />
      <ellipse cx="122" cy="62" rx="10" ry="8" fill="#facc15" stroke="#0f172a" stroke-width="2" />
      <circle cx="80" cy="62" r="3" fill="#0f172a" />
      <circle cx="120" cy="62" r="3" fill="#0f172a" />
    `;
  } else if (style === 'bunny') {
    innerSvg = `
      <path d="M72 55 C 50 -10, 85 -10, 88 55 Z" fill="#e2e8f0" stroke="#0f172a" stroke-width="3.5" />
      <path d="M128 55 C 115 -10, 150 -10, 128 55 Z" fill="#e2e8f0" stroke="#0f172a" stroke-width="3.5" />
      <ellipse cx="100" cy="142" rx="46" ry="40" fill="#e2e8f0" stroke="#0f172a" stroke-width="4" />
      <circle cx="100" cy="80" r="42" fill="#e2e8f0" stroke="#0f172a" stroke-width="4" />
      <ellipse cx="100" cy="84" rx="6" ry="4" fill="#f472b6" />
      <rect x="96" y="94" width="8" height="8" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
    `;
  } else if (style === 'duck') {
    innerSvg = `
      <ellipse cx="100" cy="140" rx="52" ry="42" fill="#facc15" stroke="#0f172a" stroke-width="4" />
      <circle cx="100" cy="75" r="42" fill="#facc15" stroke="#0f172a" stroke-width="4" />
      <ellipse cx="100" cy="85" rx="26" ry="16" fill="#f97316" stroke="#0f172a" stroke-width="3" />
      <circle cx="82" cy="65" r="7" fill="#0f172a" />
      <circle cx="118" cy="65" r="7" fill="#0f172a" />
    `;
  } else if (style === 'superhero') {
    innerSvg = `
      <path d="M25 105 Q 15 185 30 195 Q 100 205 170 195 Q 185 185 175 105 Z" fill="#dc2626" stroke="#0f172a" stroke-width="4" />
      <path d="M48 118 L 152 118 L 165 185 L 35 185 Z" fill="#1d4ed8" stroke="#0f172a" stroke-width="4" />
      <circle cx="100" cy="72" r="38" fill="#fed7aa" stroke="#0f172a" stroke-width="4" />
      <path d="M64 62 Q 100 52 136 62 Q 120 78 100 78 Q 80 78 64 62 Z" fill="#0f172a" />
    `;
  } else if (style === 'anime_hero') {
    innerSvg = `
      <path d="M35 75 Q 15 35 55 42 Q 65 10 95 20 Q 115 5 135 25 Q 165 15 160 65 Q 180 85 155 95 Q 135 45 35 75 Z" fill="#f97316" stroke="#0f172a" stroke-width="4" />
      <rect x="58" y="52" width="84" height="14" fill="#dc2626" stroke="#0f172a" stroke-width="2.5" />
      <polygon points="100,112 62,65 138,65" fill="#fed7aa" stroke="#0f172a" stroke-width="3" />
    `;
  } else {
    // Default Dog (Byte)
    innerSvg = `
      <path d="M45 45 C 20 55, 15 98, 42 108 C 55 88, 50 55, 45 45 Z" fill="#1e293b" />
      <path d="M155 45 C 180 55, 185 98, 158 108 C 145 88, 150 55, 155 45 Z" fill="#1e293b" />
      <ellipse cx="100" cy="140" rx="52" ry="42" fill="${color}" />
      <ellipse cx="100" cy="145" rx="32" ry="28" fill="#fff" opacity="0.9" />
      <rect x="70" y="112" width="60" height="10" rx="5" fill="#ef4444" />
      <circle cx="100" cy="117" r="5" fill="#f59e0b" />
      <circle cx="100" cy="72" r="46" fill="${color}" />
      <ellipse cx="100" cy="82" rx="26" ry="18" fill="#f8fafc" />
      <ellipse cx="100" cy="76" rx="8" ry="6" fill="#0f172a" />
      <g fill="#0f172a">
        <circle cx="82" cy="62" r="7" />
        <circle cx="118" cy="62" r="7" />
        <circle cx="84" cy="60" r="2.5" fill="#fff" />
        <circle cx="120" cy="60" r="2.5" fill="#fff" />
      </g>
      ${isSpeaking ? `
        <path d="M88 84 Q 100 102 112 84 Z" fill="#ef4444" stroke="#0f172a" stroke-width="3" />
        <path d="M96 92 Q 100 106 104 92 Z" fill="#f472b6" />
      ` : `
        <path d="M88 85 Q 100 95 112 85" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round" />
      `}
    `;
  }

  const svgRaw = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">${innerSvg}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgRaw)}`;
}
