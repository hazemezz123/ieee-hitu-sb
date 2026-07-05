import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useTheme } from "../theme/useTheme";

function ThemeToggleButton({ className = "", onClick, theme }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-all duration-250 ease-out hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
      onClick={onClick}
    >
      <svg
        aria-hidden="true"
        className={`theme-toggle-icon h-4 w-4 transition-all duration-200 ${isDark ? "rotate-0 scale-100" : "-rotate-90 scale-90"}`}
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isDark ? (
          <path
            d="M12 3.75V5.25M12 18.75V20.25M5.63604 5.63604L6.6967 6.6967M17.3033 17.3033L18.364 18.364M3.75 12H5.25M18.75 12H20.25M5.63604 18.364L6.6967 17.3033M17.3033 6.6967L18.364 5.63604M15.75 12C15.75 14.0711 14.0711 15.75 12 15.75C9.92893 15.75 8.25 14.0711 8.25 12C8.25 9.92893 9.92893 8.25 12 8.25C14.0711 8.25 15.75 9.92893 15.75 12Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        ) : (
          <path
            d="M20.3542 15.3542C19.3163 15.8458 18.1559 16.125 16.9303 16.125C12.507 16.125 8.92188 12.5399 8.92188 8.11656C8.92188 6.89093 9.20107 5.73055 9.6927 4.69263C6.29215 5.83316 3.84375 9.04426 3.84375 12.825C3.84375 17.5574 7.68035 21.394 12.4128 21.394C16.1935 21.394 19.4046 18.9456 20.5452 15.5451C20.4828 15.4817 20.4188 15.418 20.3542 15.3542Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </button>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setIsMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Events", href: "/events" },
    { name: "Committee", href: "/committees" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 transition-all duration-300 ease-out animate-[navbar-enter_0.6s_ease-out] ${
          isScrolled ? "py-2" : "py-4 sm:py-5"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <nav
            className={`relative flex items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-lowest/70 backdrop-blur-xl px-4 sm:px-6 transition-all duration-300 ease-out ${
              isScrolled
                ? "py-2 shadow-sm shadow-black/5"
                : "py-3 shadow-none"
            }`}
          >
            <Link to="/" className="absolute left-4 sm:left-6 flex items-center" aria-label="IEEE HITU SB Home">
              <img
                src={logo}
                alt="IEEE HITU SB"
                className={`h-10 w-auto transition-[filter] duration-200 ${
                  theme === "dark" ? "brightness-0 invert" : ""
                }`}
              />
            </Link>

            <div className="hidden md:flex items-center justify-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-250 ease-out ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface-variant hover:bg-primary/5 hover:text-on-surface"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-3 absolute right-4 sm:right-6">
              <ThemeToggleButton onClick={toggleTheme} theme={theme} />
              <Link
                to="/membership"
                className="btn btn-primary"
              >
                Join IEEE
              </Link>
            </div>

            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="md:hidden absolute right-4 sm:right-6 flex items-center justify-center h-9 w-9 rounded-full text-on-surface-variant hover:bg-primary/5 transition-colors duration-250 ease-out"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="material-symbols-outlined text-xl select-none">
                {isMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </nav>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out md:hidden ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`fixed top-0 left-0 right-0 z-40 pt-24 px-4 sm:px-6 transition-all duration-300 ease-out md:hidden ${
          isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest/95 backdrop-blur-2xl px-3 py-3 shadow-lg shadow-black/10">
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-250 ease-out ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface-variant hover:bg-primary/5 hover:text-on-surface"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="flex items-center gap-3 px-4 pt-3 mt-2 border-t border-outline-variant/15">
                <ThemeToggleButton onClick={toggleTheme} theme={theme} />
                <Link
                  to="/membership"
                  className="btn btn-primary flex-1 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join IEEE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
