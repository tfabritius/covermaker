export function shouldRotateImage(
  width: number,
  height: number,
  targetAspectRatio: number,
): boolean {
  // Calculate the current aspect ratio
  const currentAspectRatio = width / height

  // Calculate the difference between the current aspect ration and the target aspect ratio
  const difference = Math.abs(currentAspectRatio - targetAspectRatio)

  // Calculate the difference if we were to rotate the imate (swap width and height)
  const rotatedAspectRatio = height / width
  const rotatedDifference = Math.abs(rotatedAspectRatio - targetAspectRatio)

  // If the difference is smaller when rotated, we should rotate the image
  return rotatedDifference < difference
}

export function enlargeToAspectRatio(
  height: number,
  width: number,
  aspectRatio: number,
): { width: number, height: number } {
  if (width / height > aspectRatio) {
    // Enlarge the height
    height = Math.round(width / aspectRatio)
  }
  else {
    // Enlarge the width
    width = Math.round(height * aspectRatio)
  }
  return { width, height }
}
