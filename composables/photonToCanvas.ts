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
