import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Standards', href: '#' },
    { name: 'Publications', href: '#' },
    { name: 'Education', href: '#' },
    { name: 'Membership', href: '/membership' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/15">
        <div className="flex justify-between items-center px-8 py-4 max-w-full mx-auto">
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="IEEE HITU SB" 
              className="h-12 w-auto"
            />
          </Link>
          
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link
                  key={link.name}
                  className={`font-sans tracking-tight text-sm font-semibold uppercase transition-colors hidden md:block ${
                    location.pathname === link.href 
                      ? 'text-primary' 
                      : 'text-on-surface-variant hover:text-primary'
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
              )
            ))}
            <button 
              className="md:hidden text-on-surface-variant p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </nav>
      
      {isMenuOpen && (
        <div className="fixed top-[73px] left-0 w-full bg-surface-container-lowest shadow-lg z-40 md:hidden">
          <div className="flex flex-col py-4">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
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
              )
            ))}
          </div>
        </div>
      )}
    </>
  );
}