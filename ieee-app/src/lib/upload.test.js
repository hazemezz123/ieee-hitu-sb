import { afterEach, describe, expect, it, vi } from 'vitest'
import { uploadToCloudinary } from './upload'

describe('uploadToCloudinary', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('posts the file with preset and folder, returning secure_url', async () => {
    const json = vi.fn().mockResolvedValue({ secure_url: 'https://res.cloudinary.com/dweqigxnz/image/upload/v1/x.jpg' })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json })
    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['x'], 'photo.png', { type: 'image/png' })
    const url = await uploadToCloudinary(file)

    expect(url).toBe('https://res.cloudinary.com/dweqigxnz/image/upload/v1/x.jpg')
    expect(fetchMock).toHaveBeenCalledOnce()
    const [endpoint, options] = fetchMock.mock.calls[0]
    expect(endpoint).toBe('https://api.cloudinary.com/v1_1/dweqigxnz/image/upload')
    expect(options.method).toBe('POST')
    const body = options.body
    expect(body.get('upload_preset')).toBe('ieee_uploads')
    expect(body.get('folder')).toBe('ieee-admin')
    expect(body.get('file')).toBe(file)
  })

  it('throws a readable error when Cloudinary rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Invalid preset' } }),
    }))

    await expect(uploadToCloudinary(new File(['x'], 'a.png', { type: 'image/png' })))
      .rejects.toThrow('Invalid preset')
  })
})
