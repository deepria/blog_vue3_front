export const DESIGN_STORAGE_KEY = "deepria.design";
export const MODE_STORAGE_KEY = "deepria.theme";

export const designOptions = [
  {
    id: "editorial",
    code: "A",
    name: "편집 디자인",
    description: "따뜻한 여백과 정교한 타이포그래피",
    colors: ["#f5f4f0", "#3759d7", "#8d9b80"],
  },
  {
    id: "studio",
    code: "B",
    name: "그래픽 스튜디오",
    description: "선명한 대비와 대담한 그래픽",
    colors: ["#242728", "#d5ed72", "#5142dc"],
  },
  {
    id: "console",
    code: "C",
    name: "작업 콘솔",
    description: "정밀한 구성과 차분한 몰입감",
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
      base: "#f5f4f0",
      surface: "#ffffff",
      panel: "#eeeee8",
      elevated: "#ffffff",
      ink: "#252d29",
      secondary: "#59635c",
      muted: "#626b61",
      border: "#dedfd8",
      strong: "#b9c0b4",
      primary: "#3759d7",
      hover: "#2945b9",
      soft: "#e9edff",
      inverse: "#ffffff",
      sidebar: "#eeeee8",
      navInk: "#59635c",
      navSelected: "#ffffff",
      navAccent: "#3759d7",
      art: "#8d9b80",
    },
    dark: {
      base: "#151b19",
      surface: "#1d2521",
      panel: "#26302a",
      elevated: "#29352d",
      ink: "#eeefe6",
      secondary: "#cad2c8",
      muted: "#a3afa5",
      border: "#354039",
      strong: "#58695b",
      primary: "#a8b9ff",
      hover: "#c2ceff",
      soft: "#2c3851",
      inverse: "#18203a",
      sidebar: "#19211c",
      navInk: "#b7c2b8",
      navSelected: "#29352d",
      navAccent: "#a8b9ff",
      art: "#9dad90",
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
      ? [2, 3, 4, 6]
      : id === "console"
        ? [3, 5, 6, 8]
        : [5, 8, 14, 18];
  const font =
    '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
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
