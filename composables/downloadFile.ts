export function downloadFile(content: Blob, filename: string) {
  const link = document.createElement('a')
  const objectURL = URL.createObjectURL(content)
  link.href = objectURL
  link.download = filename
  link.click()
  URL.revokeObjectURL(objectURL)
}
