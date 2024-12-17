export function createCanvas() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx)
    throw new Error('Could not get 2D context')
  return { canvas, ctx }
}
