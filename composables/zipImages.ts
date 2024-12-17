import JSZip from 'jszip'

export async function zipImages(images: { dataURL: string, basename: string }[]): Promise<Blob> {
  const zip = new JSZip()

  // Iterate over the images (data URLs) and add them to the ZIP archive
  images.forEach(({ dataURL, basename }) => {
    // Convert the data URL to a Blob
    const imgBlob = dataURLToBlob(dataURL)

    // Detect extension from the data URL
    const ext = dataURL.split(';')[0].split(':')[1].split('/')[1]

    zip.file(`${basename}.${ext}`, imgBlob)
  })

  // Generate the ZIP file
  return await zip.generateAsync({ type: 'blob' })
}
