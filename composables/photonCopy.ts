import type * as photon from '@silvia-odwyer/photon'
import { usePhoton } from './usePhoton'

/**
 * Create a new blank Photon image with specified dimensions
 */
export async function photonCreateImage(width: number, height: number): Promise<photon.PhotonImage> {
  const photonLib = await usePhoton()

  // Create a canvas to initialize the PhotonImage
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get 2D context')
  }

  // Fill with white background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  return photonLib.open_image(canvas, ctx)
}

/**
 * Copy a source image onto a destination image at specified coordinates
 * This modifies the destination image in place using Photon's watermark function
 */
export async function photonCopyTo(
  destImage: photon.PhotonImage,
  srcImage: photon.PhotonImage,
  x: number,
  y: number,
): Promise<void> {
  const photonLib = await usePhoton()

  // Use Photon's watermark function to overlay the source image onto the destination
  // Note: watermark expects bigint for x and y coordinates
  photonLib.watermark(destImage, srcImage, BigInt(x), BigInt(y))
}
