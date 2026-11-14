export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MAX_UPLOAD_PIXELS = 1200;

/** Accept only real image files, and keep uploads small enough for git + storage. */
export function validateImageFile(file) {
  if (!file) return "Choose an image file first.";
  if (!/^image\/(png|jpe?g|webp|gif|avif)$/.test(file.type || ""))
    return "That file is not a PNG, JPG, WebP, GIF or AVIF image.";
  if (file.size > 8 * 1024 * 1024)
    return "That image is over 8 MB. Pick a smaller one.";
  return "";
}

/** Downscale to at most 1200px on the long side and return a JPEG data URL. */
export function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file could not be opened as an image."));
      img.onload = () => {
        try {
          const scale = Math.min(
            1,
            MAX_UPLOAD_PIXELS / Math.max(img.naturalWidth, img.naturalHeight, 1),
          );
          const width = Math.max(1, Math.round(img.naturalWidth * scale));
          const height = Math.max(1, Math.round(img.naturalHeight * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("This browser cannot resize images.");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        } catch (error) {
          reject(error);
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** Data-URL size in bytes (base64 is ~4/3 of the binary size). */
export function dataUrlBytes(dataUrl) {
  const body = String(dataUrl || "").split(",")[1] || "";
  return Math.floor((body.length * 3) / 4);
}

/** File extension for a data URL, for the server-side upload filename. */
export function dataUrlExtension(dataUrl) {
  const match = /^data:image\/(png|jpe?g|webp|gif|avif);/.exec(String(dataUrl || ""));
  if (!match) return "jpg";
  return match[1] === "jpeg" ? "jpg" : match[1];
}
