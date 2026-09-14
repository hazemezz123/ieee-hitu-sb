'use client'

export default function LoginForm({ password, setPassword, loginError, onSubmit }) {
  return (
    <div
      className="min-h-screen"
      style={{ paddingTop: "var(--navbar-height)" }}
    >
      <div
        className="flex items-center justify-center px-6"
        style={{ minHeight: "calc(100vh - var(--navbar-height))" }}
      >
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <div className="card p-6 md:p-8">
            <h1 className="text-xl font-bold mb-1">Admin Login</h1>
            <p className="text-sm text-on-surface-variant mb-6">
              Enter the admin password to manage events.
            </p>
            <label htmlFor="admin-pw" className="form-label">
              Password
            </label>
            {loginError && (
              <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-sm text-error">
                {loginError}
              </div>
            )}
            <input
              id="admin-pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input mb-4"
              autoFocus
            />
            <button type="submit" className="btn btn-primary w-full">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
