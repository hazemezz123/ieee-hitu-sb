import { afterEach, describe, expect, it, vi } from 'vitest'
import { uploadFileToCloudinary, uploadToCloudinary } from './upload'

function hangingFetch() {
  return vi.fn().mockImplementation((url, { signal } = {}) => new Promise((_, reject) => {
    signal?.addEventListener('abort', () => {
      const err = new Error('The operation was aborted.')
      err.name = 'AbortError'
      reject(err)
    })
  }))
}

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

  it('throws a readable error when Cloudinary returns a non-JSON body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => { throw new SyntaxError('Unexpected token <') },
    }))

    await expect(uploadToCloudinary(new File(['x'], 'a.png', { type: 'image/png' })))
      .rejects.toThrow('Upload failed (502)')
  })

  it('rejects with a timeout error instead of hanging forever (photo)', async () => {
    vi.useFakeTimers()
    try {
      vi.stubGlobal('fetch', hangingFetch())
      const pending = uploadToCloudinary(new File(['x'], 'a.png', { type: 'image/png' }))
      const assertion = expect(pending).rejects.toThrow('timed out')
      await vi.advanceTimersByTimeAsync(45_000)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })

  it('rejects with a timeout error instead of hanging forever (CV)', async () => {
    vi.useFakeTimers()
    try {
      vi.stubGlobal('fetch', hangingFetch())
      const pending = uploadFileToCloudinary(new File(['x'], 'cv.pdf', { type: 'application/pdf' }))
      const assertion = expect(pending).rejects.toThrow('timed out')
      await vi.advanceTimersByTimeAsync(45_000)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })
})
