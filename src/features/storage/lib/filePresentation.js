const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
  ".avif",
];
const TEXT_EXTENSIONS = [
  ".txt",
  ".md",
  ".markdown",
  ".log",
  ".csv",
  ".json",
  ".xml",
  ".yaml",
  ".yml",
];

export function getPreviewType(fileName = "") {
  const normalized = fileName.toLowerCase();
  if (IMAGE_EXTENSIONS.some((extension) => normalized.endsWith(extension))) {
    return "image";
  }
  if (TEXT_EXTENSIONS.some((extension) => normalized.endsWith(extension))) {
    return normalized.endsWith(".md") || normalized.endsWith(".markdown")
      ? "markdown"
      : "text";
  }
  return "unsupported";
}

export function enrichFileForPresentation(file) {
  const previewType = getPreviewType(file.display_name);
  return { ...file, previewType, isPreviewable: previewType !== "unsupported" };
}
