import * as photon from '@silvia-odwyer/photon'
import { usePhoton } from './usePhoton'
import { loadImage } from './loadImage'

/**
 * Convert an HTMLImageElement to a Photon PhotonImage
 */
export async function imageToPhoton(img: HTMLImageElement): Promise<photon.PhotonImage> {
  const photonLib = await usePhoton()
  
  // Create a temporary canvas to get image data
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get 2D context')
  }
  
  ctx.drawImage(img, 0, 0)
  
  // Convert canvas to PhotonImage
  return photonLib.open_image(canvas, ctx)
}

/**
 * Convert a data URL to a Photon PhotonImage
 */
export async function dataURLToPhoton(dataURL: string): Promise<photon.PhotonImage> {
  const img = await loadImage(dataURL)
  return imageToPhoton(img)
}
