'use client'

import { useEffect, useState } from 'react'

export default function PhotoInput({ id, file, setFile, url, setUrl }) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical object-URL pattern
    if (!file) { setPreview(null); return }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return (
    <div>
      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
        className="mb-2 block w-full text-sm"
      />
      <input
        type="text"
        className="form-input"
        placeholder="Or paste an image URL"
        aria-label="Image URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      {preview && (
        <img src={preview} alt="Selected photo preview" className="mt-3 h-24 w-24 rounded-lg object-cover" />
      )}
    </div>
  )
}
