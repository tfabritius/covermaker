import type * as photon from '@silvia-odwyer/photon'
import { usePhoton } from './usePhoton'

/**
 * Rotate a Photon image by the specified angle
 * @param photonImage - The image to rotate
 * @param angle - Angle in degrees (90, 180, 270, etc.)
 */
export async function photonRotate(photonImage: photon.PhotonImage, angle: number): Promise<photon.PhotonImage> {
  const photonLib = await usePhoton()
  return photonLib.rotate(photonImage, angle)
}

/**
 * Rotate a Photon image 90 degrees clockwise
 */
export async function photonRotate90(photonImage: photon.PhotonImage): Promise<photon.PhotonImage> {
  return photonRotate(photonImage, 90)
}
