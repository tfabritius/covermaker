import JSZip from 'jszip'

/**
 * Zip image Blobs.
 * Derives file extension from Blob.type.
 */
export async function zipImages(images: { blob: Blob, basename: string }[]): Promise<Blob> {
  const zip = new JSZip()

  images.forEach(({ blob, basename }) => {
    const mime = blob.type || 'application/octet-stream'
    const ext = mime.split('/')[1] || 'bin'
    zip.file(`${basename}.${ext}`, blob)
  })

  return await zip.generateAsync({ type: 'blob' })
}
