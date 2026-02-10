import planetsData from '../data/planets.json';
import starsData from '../data/stars.json';

const hashToUnit = (text) => {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967296;
};

const getSessionSeed = () => {
  try {
    const raw = localStorage.getItem('ssg_session');
    if (!raw) {
      return 'HEX-SECTOR-GEMINI';
    }

    const session = JSON.parse(raw);
    return session?.generatorSettings?.seed || 'HEX-SECTOR-GEMINI';
  } catch {
    return 'HEX-SECTOR-GEMINI';
  }
};

const pickFromList = (list, roll) => {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }

  const index = Math.min(list.length - 1, Math.floor(roll * list.length));
  return list[index];
};

const buildStarSvg = (colors) => {
  const core = colors?.core || '#ffd87f';
  const mid = colors?.mid || '#ffe39f';
  const halo = colors?.halo || '#fff5d5';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <radialGradient id="starGrad" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="${mid}"/>
          <stop offset="100%" stop-color="${core}"/>
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#020617"/>
      <circle cx="32" cy="32" r="20" fill="${halo}" opacity="0.38"/>
      <circle cx="32" cy="32" r="13" fill="url(#starGrad)"/>
    </svg>
  `;
};

const buildPlanetSvg = (colors) => {
  const base = colors?.base || '#10B981';
  const secondary = colors?.secondary || '#3B82F6';
  const atmosphere = colors?.atmosphere || '#60A5FA';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <radialGradient id="planetGrad" cx="30%" cy="30%" r="75%">
          <stop offset="0%" stop-color="${base}"/>
          <stop offset="100%" stop-color="${secondary}"/>
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#020617"/>
      <circle cx="32" cy="32" r="20" fill="${atmosphere}" opacity="0.22"/>
      <circle cx="32" cy="32" r="16" fill="url(#planetGrad)"/>
      <path d="M16 31 Q32 24 48 31" stroke="${secondary}" stroke-width="2.4" fill="none" opacity="0.7"/>
    </svg>
  `;
};

const toDataUrl = (svg) => `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;

const setFaviconHref = (href) => {
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    document.head.appendChild(link);
  }

  link.setAttribute('type', 'image/svg+xml');
  link.setAttribute('href', href);
};

export const applyDynamicFavicon = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const seed = getSessionSeed();
  const kindRoll = hashToUnit(`${seed}:favicon:kind`);

  if (kindRoll < 0.5) {
    const star = pickFromList(starsData, hashToUnit(`${seed}:favicon:star`));
    setFaviconHref(toDataUrl(buildStarSvg(star?.color)));
    return;
  }

  const planets = Object.values(planetsData);
  const planet = pickFromList(planets, hashToUnit(`${seed}:favicon:planet`));
  setFaviconHref(toDataUrl(buildPlanetSvg(planet?.color)));
};
