import { Link } from "react-router-dom";
import { useTheme } from "../theme/useTheme";
import logo from "../assets/logo.png";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="relative w-full bg-surface-container-highest pt-16 pb-8 text-on-surface animate-fade-up bg-dot-pattern">
      <div className="relative section-content mx-auto flex max-w-7xl flex-col items-center gap-12 px-12 md:flex-row md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="IEEE HITU Student Branch"
            className={`h-12 w-auto transition-[filter] duration-200 ${theme === "dark" ? "brightness-0 invert" : ""}`}
          />
        </div>
        <nav className="flex flex-wrap justify-center gap-8">
          <Link
            className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary"
            to="/"
          >
            Home
          </Link>
          <Link
            className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary"
            to="/about"
          >
            About
          </Link>
          <Link
            className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary"
            to="/events"
          >
            Events
          </Link>
          <Link
            className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary"
            to="/committees"
          >
            Committee
          </Link>
          <Link
            className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary"
            to="/gallery"
          >
            Gallery
          </Link>
          <Link
            className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary"
            to="/contact"
          >
            Contact
          </Link>
          <Link
            className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary"
            to="/membership"
          >
            Join IEEE
          </Link>
        </nav>
        <div className="flex gap-4">
          <span className="material-symbols-outlined cursor-pointer text-primary transition-colors hover:text-on-surface">
            share
          </span>
          <span className="material-symbols-outlined cursor-pointer text-primary transition-colors hover:text-on-surface">
            rss_feed
          </span>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl items-center justify-center border-t border-outline-variant/30 px-12 pt-8 opacity-80">
        <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
          © 2026 IEEE HITU Student Branch
        </p>
      </div>
    </footer>
  );
}
