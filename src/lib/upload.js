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
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error?.message || `Upload failed (${res.status})`)
  if (!data.secure_url) throw new Error(`Upload failed (${res.status})`)
  return data.secure_url
}

const CLOUD_NAME_FILE = 'dweqigxnz'
const UPLOAD_PRESET_FILE = 'ieee_uploads'

export async function uploadFileToCloudinary(file) {
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET_FILE)
  body.append('folder', 'ieee-recruitment')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME_FILE}/raw/upload`, { method: 'POST', body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error?.message || `Upload failed (${res.status})`)
  if (!data.secure_url) throw new Error(`Upload failed (${res.status})`)
  return data.secure_url
}
