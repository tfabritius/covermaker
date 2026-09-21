export function getBasename(v: string): string {
  return v.split('.').slice(0, -1).join('.')
}

export function getResizedBasename(v: string): string {
  return `${getBasename(v)}-resized`
}
