const CLOUD_NAME = 'dweqigxnz'
const UPLOAD_PRESET = 'ieee_uploads'

export const UPLOAD_TIMEOUT_MS = 45_000

async function postToCloudinary(endpoint, body, label) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS)
  try {
    const res = await fetch(endpoint, { method: 'POST', body, signal: controller.signal })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error?.message || `Upload failed (${res.status})`)
    if (!data.secure_url) throw new Error(`Upload failed (${res.status})`)
    return data.secure_url
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error(`${label} upload timed out. Check your connection and try again.`)
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export async function uploadToCloudinary(file) {
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)
  body.append('folder', 'ieee-admin')

  return postToCloudinary(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, body, 'Photo')
}

const CLOUD_NAME_FILE = 'dweqigxnz'
const UPLOAD_PRESET_FILE = 'ieee_uploads'

export async function uploadFileToCloudinary(file) {
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET_FILE)
  body.append('folder', 'ieee-recruitment')
  return postToCloudinary(`https://api.cloudinary.com/v1_1/${CLOUD_NAME_FILE}/raw/upload`, body, 'CV')
}
