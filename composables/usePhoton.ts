import * as photon from '@silvia-odwyer/photon'

let photonInitialized = false

/**
 * Initialize the Photon WASM library
 * Must be called before using any Photon functions
 */
export async function usePhoton() {
  if (!photonInitialized) {
    await photon.default()
    photonInitialized = true
  }
  return photon
}
