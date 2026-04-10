import logo from '../assets/logo.png';
import { useTheme } from '../theme/useTheme';

export default function Hero() {
  const { theme } = useTheme();

  return (
    <section className="relative min-h-[870px] flex items-center overflow-hidden bg-surface-container-lowest ">
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent" style={{ transform: 'rotate(0deg) scale(1.5)' }}></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-secondary-container wedge-accent" style={{ transform: 'rotate(180deg) scale(1.2)' }}></div>
      </div>
      <div className="container mx-auto px-12 relative z-10 max-w-4xl text-center">
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="  px-5 py-4  md:px-6">
              <img
                src={logo}
                alt="IEEE HITU Student Branch logo"
                className={`h-24 w-auto transition-[filter] duration-200 md:h-32 ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
              />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight text-on-surface leading-[1.05]">
            Beyond Labels. <br />
            <span className="text-primary">Beyond Limits.</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            The world's largest technical professional organization dedicated to advancing technology for the benefit of humanity through highly cited publications, conferences, and technology standards.
          </p>
          <div className="flex gap-4 pt-4 justify-center">
            <button className="btn-wedge bg-primary text-on-primary px-8 py-4 font-bold tracking-wide uppercase hover:bg-primary-container transition-all">
              Explore Standards
            </button>
            <button className="px-8 py-4 font-bold tracking-wide uppercase text-primary border-b-2 border-transparent hover:border-primary transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
