export const DASHBOARD_DIRECTORY = {
  id: "dashboard",
  name: "Dashboard",
  parent_id: null,
  sort_order: 0,
};

export function normalizeOrganization(data = {}) {
  return {
    directories: Array.isArray(data.directories) ? data.directories : [],
    file_locations:
      data.file_locations && typeof data.file_locations === "object"
        ? data.file_locations
        : {},
  };
}

export function collectDirectoryIds(directories, rootId) {
  const ids = new Set([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    directories.forEach((directory) => {
      if (directory.parent_id && ids.has(directory.parent_id) && !ids.has(directory.id)) {
        ids.add(directory.id);
        changed = true;
      }
    });
  }
  return ids;
}
