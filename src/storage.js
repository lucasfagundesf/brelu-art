import { defaults } from "./fields.js";
import { calculate, normalize } from "./pricing.js";
export const dataKey = "atelie-v1",
  draftKey = "brelu-draft-v1";
export const emptyDraft = () => ({
  values: {
    name: "",
    category: "Imagem religiosa",
    version: "Crua",
    channel: "Venda direta",
    ...defaults,
  },
  photo: "",
  editing: null,
});
export function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function validateData(data) {
  if (!Array.isArray(data?.pieces) || !Array.isArray(data.expenses))
    throw Error("Formato de backup inválido.");
  for (const item of data.pieces) {
    if (
      typeof item.id !== "string" ||
      typeof item.values?.name !== "string" ||
      typeof item.photo !== "string" ||
      (item.photo &&
        !/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(item.photo))
    )
      throw Error("Peça inválida no backup.");
    calculate(item.values);
  }
  for (const e of data.expenses)
    if (
      typeof e.id !== "string" ||
      typeof e.description !== "string" ||
      typeof e.kind !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(e.date) ||
      !Number.isFinite(e.amount) ||
      e.amount <= 0
    )
      throw Error("Gasto inválido no backup.");
  return {
    pieces: data.pieces.map((p) => ({ ...p, values: normalize(p.values) })),
    expenses: data.expenses,
  };
}
export function today() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}
export function downloadBackup(data) {
  const blob = new Blob(
    [JSON.stringify({ format: "atelie-v1", ...data }, null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = "brelu-art-backup-" + today() + ".json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function resizePhoto(file) {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  )
    throw Error("Escolha uma imagem JPG, PNG ou WebP de até 10 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 600 / Math.max(bitmap.width, bitmap.height)),
      canvas = document.createElement("canvas");
    canvas.width = bitmap.width * scale;
    canvas.height = bitmap.height * scale;
    canvas
      .getContext("2d")
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.75);
  } finally {
    bitmap.close();
  }
}
