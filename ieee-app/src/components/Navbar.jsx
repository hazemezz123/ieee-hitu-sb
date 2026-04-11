import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";
import { useTheme } from "../theme/useTheme";

function ThemeToggleButton({ className = "", onClick, theme }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex h-11 w-11 items-center justify-center border border-outline-variant/30 bg-surface text-on-surface transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 ${className}`}
      onClick={onClick}
    >
      <svg
        aria-hidden="true"
        className={`theme-toggle-icon h-5 w-5 ${isDark ? "rotate-0 scale-100" : "-rotate-90 scale-90"}`}
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
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Committees", href: "/committees" },
    { name: "Events", href: "/events" },
    { name: "Join Us", href: "/join-us" },
    { name: "Membership", href: "/membership" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          duration: 0.6,
        }}
        className="sticky top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/15 "
      >
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-full mx-auto">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="IEEE HITU SB"
              className={`h-12 w-auto transition-[filter] duration-200 ${theme === "dark" ? "brightness-0 invert" : ""}`}
            />
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.name}
                  className={`font-sans tracking-tight text-sm font-semibold uppercase transition-colors hidden md:block ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                  to={link.href}
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  className="font-sans tracking-tight text-sm font-semibold uppercase text-on-surface-variant hover:text-primary transition-colors hidden md:block"
                  href={link.href}
                >
                  {link.name}
                </a>
              ),
            )}
            <ThemeToggleButton
              className="hidden md:inline-flex"
              onClick={toggleTheme}
              theme={theme}
            />
            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              className="md:hidden text-on-surface-variant p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="material-symbols-outlined">
                {isMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </motion.nav>

      {isMenuOpen && (
        <div className="fixed top-[73px] left-0 w-full bg-surface-container-lowest shadow-lg z-40 md:hidden">
          <div className="flex flex-col py-4">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.name}
                  className="font-sans tracking-tight text-sm font-semibold uppercase text-on-surface-variant hover:text-primary transition-colors px-8 py-3"
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  className="font-sans tracking-tight text-sm font-semibold uppercase text-on-surface-variant hover:text-primary transition-colors px-8 py-3"
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ),
            )}
            <div className="px-8 py-3">
              <ThemeToggleButton onClick={toggleTheme} theme={theme} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
