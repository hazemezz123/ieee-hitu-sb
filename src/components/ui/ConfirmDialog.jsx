'use client'

export default function ConfirmDialog({ title, onCancel, onConfirm, busy = false, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={onCancel}>
      <div className="card shadow-xl p-6 md:p-8 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-on-surface-variant mb-6">{children}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn btn-secondary text-sm">Cancel</button>
          <button onClick={onConfirm} disabled={busy} className="btn bg-error text-white text-sm hover:bg-error/90">Delete</button>
        </div>
      </div>
    </div>
  )
}
