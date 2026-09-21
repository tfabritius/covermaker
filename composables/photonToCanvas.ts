import type * as photon from '@silvia-odwyer/photon'
import { usePhoton } from './usePhoton'

/**
 * Convert a Photon PhotonImage to an HTMLCanvasElement for display
 * Canvas is only used for display purposes, not for manipulation
 */
export async function photonToCanvas(photonImage: photon.PhotonImage): Promise<HTMLCanvasElement> {
  const photonLib = await usePhoton()

  // Create a canvas element
  const canvas = document.createElement('canvas')
  canvas.width = photonImage.get_width()
  canvas.height = photonImage.get_height()

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get 2D context')
  }

  // Put the Photon image data onto the canvas
  photonLib.putImageData(canvas, ctx, photonImage)

  return canvas
}

/**
 * Convert a Photon PhotonImage to a data URL
 */
export async function photonToDataURL(photonImage: photon.PhotonImage, type: string = 'image/png'): Promise<string> {
  const canvas = await photonToCanvas(photonImage)
  return canvas.toDataURL(type)
}

/**
 * Convert a Photon PhotonImage to a Blob
 */
export async function photonToBlob(
  photonImage: photon.PhotonImage,
  type: string = 'image/png',
  quality?: number,
): Promise<Blob> {
  const canvas = await photonToCanvas(photonImage)
  return await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob)
          resolve(blob)
        else reject(new Error('Canvas toBlob returned null'))
      }, type, quality)
    }
    catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      reject(err)
    }
  })
}
