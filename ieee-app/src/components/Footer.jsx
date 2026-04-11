import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/useTheme';
import logo from '../assets/logo.png';

export default function Footer() {
  const { theme } = useTheme();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full border-t-4 border-primary bg-surface-container-highest pt-16 pb-8 text-on-surface"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-12 md:flex-row md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="IEEE HITU Student Branch"
            className={`h-12 w-auto transition-[filter] duration-200 ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
          />
        </div>
        <nav className="flex flex-wrap justify-center gap-8">
          <Link className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary" to="/about">About</Link>
          <Link className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary" to="/committees">Committees</Link>
          <Link className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary" to="/events">Events</Link>
          <Link className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary" to="/join">Join Us</Link>
          <Link className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary" to="/membership">Membership</Link>
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
          © 2024 IEEE HITU Student Branch
        </p>
      </div>
    </motion.footer>
  );
}
