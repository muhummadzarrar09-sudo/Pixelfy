/** Image decode helpers — local files only, EXIF orientation respected. */

export function isHeic(name: string, type: string): boolean {
  return /heic|heif/i.test(type) || /\.(heic|heif)$/i.test(name);
}

export async function decodeToBitmap(blob: Blob, name = ''): Promise<ImageBitmap> {
  if (isHeic(name, blob.type)) {
    throw new Error('HEIC/HEIF is not decodable in browsers without a converter — export as JPEG first (on-device AI conversion planned).');
  }
  try {
    // honour EXIF orientation so phone photos come in upright
    return await createImageBitmap(blob, { imageOrientation: 'from-image' } as ImageBitmapOptions);
  } catch {
    return await createImageBitmap(blob);
  }
}

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, '');
}

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
