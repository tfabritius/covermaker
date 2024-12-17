export function dataURLToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',')

  // Decode the base64 string and convert to binary string
  const bstr = atob(arr[1])

  // Create a binary array
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  // Fill the binary array with the decoded data
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  // Return the Blob
  return new Blob([u8arr], { type: arr[0].split(':')[1].split(';')[0] })
}
