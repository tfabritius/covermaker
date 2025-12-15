import type * as photon from '@silvia-odwyer/photon'
import { usePhoton } from './usePhoton'

/**
 * Apply Gaussian blur to a Photon image
 * Note: This modifies the image in place
 */
export async function photonBlur(
  photonImage: photon.PhotonImage,
  radius: number,
): Promise<void> {
  const photonLib = await usePhoton()

  // Photon's gaussian_blur modifies the image in place
  photonLib.gaussian_blur(photonImage, radius)
}
