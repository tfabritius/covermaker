import type * as photon from '@silvia-odwyer/photon'
import { usePhoton } from './usePhoton'

/**
 * Resize a Photon image to specified dimensions
 */
export async function photonResize(
  photonImage: photon.PhotonImage,
  width: number,
  height: number,
  samplingFilter: number = 1, // 1 = Nearest, 2 = Triangle, 3 = CatmullRom, 4 = Gaussian, 5 = Lanczos3
): Promise<photon.PhotonImage> {
  const photonLib = await usePhoton()

  // Photon's resize function
  return photonLib.resize(photonImage, width, height, samplingFilter)
}
