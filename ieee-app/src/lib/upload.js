const CLOUD_NAME = 'dweqigxnz'
const UPLOAD_PRESET = 'ieee_uploads'

export async function uploadToCloudinary(file) {
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)
  body.append('folder', 'ieee-admin')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `Upload failed (${res.status})`)
  return data.secure_url
}
