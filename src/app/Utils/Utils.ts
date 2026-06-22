export function isEmptyCode(code: string | null | undefined): boolean {
  return !code || code.trim().length === 0 || code === '00000000-0000-0000-0000-000000000000';
}

export function getDefaultProfileImageUrl(gender?: string): string {
  const defaultProfilePicture =  '/images/default-profile-picture-male.png';

  return gender && gender === 'female'
    ? defaultProfilePicture.replace("male", `${gender}`)
    : defaultProfilePicture;
}

export function getWindowWidth(): string
{
  let width: string = '60%';

  if (window.innerWidth < 600)
      width = '95%';

  return width;
}

export function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

export function saveFile(blob: Blob, fileName: string): void {
  const url: string = URL.createObjectURL(blob);
  const anchor: HTMLAnchorElement = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function sanitizeFileName(name: string, fallback: string): string {
  const sanitized: string = name
    .normalize('NFD').replace(/\p{M}+/gu, '')
    .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
    .trim()
    .replace(/\s+/g, '-');

  if (sanitized.length > 0)
    return sanitized;

  return fallback;
}

export function removeEmptyFields<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj)
    .filter(([_, v]) => v !== null && v !== undefined && v !== '')
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
}
