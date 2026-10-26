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

const fileCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export function sortFiles(files, key = "name", direction = "asc") {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...files].sort((left, right) => {
    if (key === "created_at") {
      const leftHasDate = Number.isFinite(left.created_at);
      const rightHasDate = Number.isFinite(right.created_at);
      // Legacy files without a registration date stay last in either direction.
      if (leftHasDate !== rightHasDate) return leftHasDate ? -1 : 1;
      if (leftHasDate && left.created_at !== right.created_at) {
        return (left.created_at - right.created_at) * multiplier;
      }
    } else if (key === "extension") {
      const extension = (name = "") => {
        const lastDot = name.lastIndexOf(".");
        return lastDot === -1 ? "" : name.slice(lastDot).toLowerCase();
      };
      const result = fileCollator.compare(
        extension(left.display_name),
        extension(right.display_name),
      );
      if (result !== 0) return result * multiplier;
    }
    return (
      fileCollator.compare(left.display_name || "", right.display_name || "") *
      multiplier
    );
  });
}
