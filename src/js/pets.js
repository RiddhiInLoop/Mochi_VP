// ============================================================
// pets.js — Pet Type Definitions + SVG Sprite Generator
// This file MUST load before app.js because app.js uses
// the svg() function and TY object defined here.
// ============================================================


// $ is a shorthand helper for document.getElementById()
// Instead of typing document.getElementById('pet') every time,
// we just write $('pet') — saves a lot of repetition.
const $ = id => document.getElementById(id);


// ============================================================
// PET TYPE DEFINITIONS (TY)
// Each pet type has:
//   b  = body base color
//   p  = accent / patch color
//   n  = display name
// ============================================================
const TY = {
  cat:      { b: '#fff1e0', p: '#e9a45f', n: 'Cat'      },
  dog:      { b: '#f2d2a4', p: '#a8693a', n: 'Dog'      },
  rabbit:   { b: '#fffaf5', p: '#f4b9c4', n: 'Rabbit'   },
  elephant: { b: '#e6eaf3', p: '#b4bfd6', n: 'Elephant' },
};


// ============================================================
// svg(type, mood) — SVG Sprite Generator
// Draws the correct pet in the correct mood using inline SVG.
// All pet art is generated programmatically — no image files!
//
// Parameters:
//   t    = pet type key ('cat', 'dog', 'rabbit', 'elephant')
//   mood = 'idle' | 'happy' | 'sad' | 'sleep'
// ============================================================
function svg(t, mood) {

  const c = TY[t]; // Get this pet's colors

  // --- EYES ---
  // Sleep mood: closed curved lines (zzz eyes)
  // Awake mood: two filled circles with white shine dots
  const e = mood == 'sleep'
    ? `<path d="M40 60q6 5 12 0M68 60q6 5 12 0"
         stroke="#4a3238" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<circle cx="46" cy="60" r="5" fill="#3a2a2e"/>
       <circle cx="74" cy="60" r="5" fill="#3a2a2e"/>
       <circle cx="48" cy="58" r="1.8" fill="#fff"/>
       <circle cx="76" cy="58" r="1.8" fill="#fff"/>`;

  // --- EARS ---
  // Each pet type has unique ear shapes drawn with SVG paths/ellipses
  const ears =
    t == 'elephant'
      ? /* Big round side ears */
        `<ellipse cx="20" cy="58" rx="20" ry="27" fill="${c.p}"/>
         <ellipse cx="100" cy="58" rx="20" ry="27" fill="${c.p}"/>
         <ellipse cx="22" cy="58" rx="11" ry="18" fill="#f3c6d0"/>
         <ellipse cx="98" cy="58" rx="11" ry="18" fill="#f3c6d0"/>`
      : t == 'cat'
      ? /* Pointed triangular ears */
        `<path d="M26 44L30 12L56 30Z M94 44L90 12L64 30Z" fill="${c.p}"/>
         <path d="M33 34L34 20L47 29Z M87 34L86 20L73 29Z" fill="#f7b8b8"/>`
      : t == 'dog'
      ? /* Floppy side ears */
        `<ellipse cx="26" cy="52" rx="12" ry="22" fill="${c.p}" transform="rotate(15 26 52)"/>
         <ellipse cx="94" cy="52" rx="12" ry="22" fill="${c.p}" transform="rotate(-15 94 52)"/>`
      : /* Rabbit: tall upright ears */
        `<ellipse cx="42" cy="20" rx="9" ry="24" fill="${c.b}" stroke="#e6cfc6" stroke-width="2"/>
         <ellipse cx="78" cy="20" rx="9" ry="24" fill="${c.b}" stroke="#e6cfc6" stroke-width="2"/>
         <ellipse cx="42" cy="22" rx="4" ry="16" fill="${c.p}"/>
         <ellipse cx="78" cy="22" rx="4" ry="16" fill="${c.p}"/>`;

  // --- TAIL ---
  // Elephant: short curved trunk-like tail
  // Rabbit: fluffy white pom-pom circle
  // Cat/Dog: long curved tail
  const tail =
    t == 'elephant'
      ? `<path d="M92 100Q108 100 106 88" stroke="${c.p}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      : t == 'rabbit'
      ? `<circle cx="98" cy="98" r="9" fill="#fff" stroke="#e6cfc6" stroke-width="2"/>`
      : `<path d="M90 100Q116 98 110 70" stroke="${c.p}" stroke-width="12" fill="none" stroke-linecap="round"/>`;

  // --- FULL SVG ---
  // Assembles the complete pet SVG from all the parts above.
  // The heart (♥) only appears in 'happy' mood.
  return `<svg viewBox="0 0 120 120">
    ${tail}
    <ellipse cx="60" cy="96" rx="34" ry="22" fill="${c.b}"/>
    <ellipse cx="46" cy="96" rx="14" ry="18" fill="${c.p}" opacity=".85"/>
    <ellipse cx="42" cy="114" rx="9" ry="5" fill="${c.b}" stroke="#ecd6c6"/>
    <ellipse cx="78" cy="114" rx="9" ry="5" fill="${c.b}" stroke="#ecd6c6"/>
    ${ears}
    <ellipse cx="60" cy="60" rx="40" ry="33" fill="${c.b}"/>
    <ellipse cx="38" cy="45" rx="14" ry="10" fill="${c.p}" opacity=".9"/>
    ${e}
    <ellipse cx="36" cy="70" rx="6" ry="4" fill="#f9aaa8" opacity=".7"/>
    <ellipse cx="84" cy="70" rx="6" ry="4" fill="#f9aaa8" opacity=".7"/>
    ${t == 'elephant'
      ? `<path d="M60 66Q60 92 48 97" stroke="${c.p}" stroke-width="11" fill="none" stroke-linecap="round"/>`
      : `<path d="M57 67h6l-3 4z" fill="#d86a6a"/>`}
    <path d="M52 74q4 5 8 0q4 5 8 0" stroke="#4a3238" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${mood == 'happy' ? `<text x="94" y="30" font-size="16" fill="#f26b8a">♥</text>` : ''}
  </svg>`;
}
