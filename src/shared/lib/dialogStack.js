const dialogs = [];
let previousOverflow = "";
export function pushDialog(dialog) {
  if (!dialogs.length) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  dialogs.push(dialog);
}
export function removeDialog(dialog) {
  const index = dialogs.indexOf(dialog);
  if (index >= 0) dialogs.splice(index, 1);
  if (!dialogs.length) document.body.style.overflow = previousOverflow;
}
export function isTopDialog(dialog) {
  return dialogs.at(-1) === dialog;
}
