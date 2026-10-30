export const DESIGN_STORAGE_KEY = "deepria.design";
export const MODE_STORAGE_KEY = "deepria.theme";

export const designOptions = [
  {
    id: "editorial",
    code: "A",
    name: "편집 디자인",
    description: "종이의 온기, 명조 제목과 넉넉한 여백",
    colors: ["#f7f3eb", "#8e4b36", "#8d9b80"],
  },
  {
    id: "studio",
    code: "B",
    name: "그래픽 스튜디오",
    description: "라임과 보라, 굵은 선과 포스터 같은 구성",
    colors: ["#242728", "#d5ed72", "#5142dc"],
  },
  {
    id: "console",
    code: "C",
    name: "작업 콘솔",
    description: "정밀한 격자, 민트 포인트와 밀도 높은 패널",
    colors: ["#10171c", "#8cd8c3", "#2c3c43"],
  },
];
export const normalizeDesign = (value) =>
  designOptions.some((option) => option.id === value) ? value : "editorial";
export const normalizeMode = (value) => (value === "dark" ? "dark" : "light");

// The same palette drives CSS, native controls and Ant Design (including teleports).
const palettes = {
  editorial: {
    light: {
      base: "#f7f3eb",
      surface: "#fffdf8",
      panel: "#eee7da",
      elevated: "#fffdf8",
      ink: "#302d29",
      secondary: "#625a50",
      muted: "#716557",
      border: "#ddd3c3",
      strong: "#a79984",
      primary: "#8e4b36",
      hover: "#703724",
      soft: "#f2e4d9",
      inverse: "#ffffff",
      sidebar: "#f0e9dc",
      navInk: "#625a50",
      navSelected: "#fffdf8",
      navAccent: "#8e4b36",
      art: "#7d8c70",
    },
    dark: {
      base: "#1e1c19",
      surface: "#28241f",
      panel: "#332d26",
      elevated: "#373027",
      ink: "#f3ebde",
      secondary: "#d5c9b7",
      muted: "#b8a992",
      border: "#484034",
      strong: "#74654f",
      primary: "#e5b49a",
      hover: "#f0ccb7",
      soft: "#47332a",
      inverse: "#322017",
      sidebar: "#24201b",
      navInk: "#d5c9b7",
      navSelected: "#373027",
      navAccent: "#e5b49a",
      art: "#a6b394",
    },
  },
  studio: {
    light: {
      base: "#f2f1e9",
      surface: "#ffffff",
      panel: "#eae9df",
      elevated: "#ffffff",
      ink: "#242728",
      secondary: "#565d54",
      muted: "#60685b",
      border: "#d6d8cb",
      strong: "#a5aa97",
      primary: "#5142dc",
      hover: "#3e30bf",
      soft: "#ece8ff",
      inverse: "#ffffff",
      sidebar: "#242728",
      navInk: "#c0c7b9",
      navSelected: "#d5ed72",
      navAccent: "#242728",
      art: "#d5ed72",
    },
    dark: {
      base: "#1c1c22",
      surface: "#262630",
      panel: "#30303b",
      elevated: "#363641",
      ink: "#f4f0e8",
      secondary: "#d0ccd6",
      muted: "#b5b2bd",
      border: "#44424c",
      strong: "#706a7e",
      primary: "#b8abff",
      hover: "#d0c7ff",
      soft: "#3c3456",
      inverse: "#211d33",
      sidebar: "#242728",
      navInk: "#c0c7b9",
      navSelected: "#d5ed72",
      navAccent: "#242728",
      art: "#d5ed72",
    },
  },
  console: {
    light: {
      base: "#eaf0ee",
      surface: "#f7faf8",
      panel: "#dfe8e4",
      elevated: "#ffffff",
      ink: "#203c34",
      secondary: "#49645a",
      muted: "#536b60",
      border: "#bfcec6",
      strong: "#8fa99b",
      primary: "#206753",
      hover: "#174c3d",
      soft: "#d3e7dd",
      inverse: "#ffffff",
      sidebar: "#dfe8e4",
      navInk: "#49645a",
      navSelected: "#cee1d6",
      navAccent: "#174c3d",
      art: "#206753",
    },
    dark: {
      base: "#10171c",
      surface: "#172127",
      panel: "#1d2b31",
      elevated: "#22333b",
      ink: "#e1edf0",
      secondary: "#bbd0d7",
      muted: "#90a5ae",
      border: "#2c3c43",
      strong: "#4f6973",
      primary: "#8cd8c3",
      hover: "#ace9da",
      soft: "#203b35",
      inverse: "#10251f",
      sidebar: "#0b1116",
      navInk: "#9eb4bc",
      navSelected: "#203b35",
      navAccent: "#8cd8c3",
      art: "#8cd8c3",
    },
  },
};

export function getAppearance(design, mode) {
  const id = normalizeDesign(design);
  const dark = normalizeMode(mode) === "dark";
  const p = palettes[id][dark ? "dark" : "light"];
  const radius =
    id === "studio"
      ? [0, 2, 2, 2]
      : id === "console"
        ? [2, 3, 4, 4]
        : [4, 6, 10, 14];
  const font =
    '"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const mono = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';
  const heading =
    id === "editorial"
      ? '"Iowan Old Style", "Palatino Linotype", "Nanum Myeongjo", "AppleMyungjo", "Batang", serif'
      : font;
  const vars = {
    "color-bg-base": p.base,
    "color-bg-surface": p.surface,
    "color-bg-elevated": p.elevated,
    "color-bg-panel": p.panel,
    "color-bg-panel-strong": p.panel,
    "color-bg-panel-soft": p.soft,
    "color-text-primary": p.ink,
    "color-text-secondary": p.secondary,
    "color-text-muted": p.muted,
    "color-text-disabled": dark ? "#7b8580" : "#828a82",
    "text-inverse": p.inverse,
    "text-danger-inverse": dark ? "#351111" : "#ffffff",
    "color-border": p.border,
    "color-border-strong": p.strong,
    "color-border-bright": p.primary,
    "color-primary": p.primary,
    "color-primary-strong": p.hover,
    "color-primary-soft": p.soft,
    "color-primary-glow": `${p.primary}26`,
    "color-accent": p.art,
    "color-success": dark ? "#92d7ac" : "#247346",
    "color-warning": dark ? "#edc079" : "#95601d",
    "color-danger": dark ? "#ffabab" : "#ba3030",
    "bg-overlay": dark ? "#050907b8" : "#17231c80",
    "glass-bg": p.surface,
    "glass-bg-elevated": p.elevated,
    "glass-bg-hover": p.panel,
    "nav-bg": p.sidebar,
    "nav-ink": p.navInk,
    "nav-selected": p.navSelected,
    "nav-accent": p.navAccent,
    "nav-heading": id === "studio" ? "#f2f3e7" : p.ink,
    "brand-color": id === "studio" ? "#d5ed72" : p.primary,
    "art-color": p.art,
    "font-family": font,
    "font-heading": heading,
    "font-mono": mono,
    "theme-shadow": id === "studio" ? `4px 4px 0 ${p.strong}` : "none",
    "font-size-body": "15px",
    "font-size-hero": "34px",
    "radius-sm": `${radius[0]}px`,
    "radius-md": `${radius[1]}px`,
    "radius-lg": `${radius[2]}px`,
    "radius-xl": `${radius[3]}px`,
    "shadow-sm": "0 1px 2px #17231c05",
    "shadow-md": dark ? "0 8px 24px #0003" : "0 8px 24px #17231c0a",
    "shadow-lg": dark ? "0 18px 44px #0005" : "0 18px 44px #17231c12",
    "glass-shadow": dark ? "0 18px 44px #0005" : "0 18px 44px #17231c12",
    "glass-shadow-deep": "0 24px 64px #0004",
  };
  return {
    vars,
    ant: {
      colorPrimary: p.primary,
      colorPrimaryHover: p.hover,
      colorPrimaryActive: p.hover,
      colorBgBase: p.base,
      colorBgContainer: p.surface,
      colorBgElevated: p.elevated,
      colorBorder: p.border,
      colorTextBase: p.ink,
      colorText: p.ink,
      colorTextSecondary: p.secondary,
      colorTextPlaceholder: p.muted,
      colorTextLightSolid: p.inverse,
      colorSuccess: vars["color-success"],
      colorWarning: vars["color-warning"],
      colorError: vars["color-danger"],
      borderRadius: radius[1],
      fontFamily: font,
      fontSize: 15,
    },
  };
}

export function readPreference(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
export function writePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* In restricted storage, keep the in-memory choice. */
  }
}
