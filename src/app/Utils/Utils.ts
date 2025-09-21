export function isEmptyCode(code: string | null | undefined): boolean {
  return !code || code.trim().length === 0 || code === '00000000-0000-0000-0000-000000000000';
}

export function getDefaultProfileImageUrl(gender?: string): string {
  const defaultProfilePicture =  '/images/default-profile-picture-male.png';

  return gender && gender === 'female'
    ? defaultProfilePicture.replace("male", `${gender}`)
    : defaultProfilePicture;
}
