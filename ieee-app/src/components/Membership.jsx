import { Link } from 'react-router-dom';

const communityItems = [
  { icon: 'school', title: 'Student Programs', description: 'Resources and scholarships for the next generation of technical innovators.' },
  { icon: 'business_center', title: 'Career Center', description: 'Strategic tools and opportunities for professional growth at every career stage.' },
  { icon: 'diversity_3', title: 'Societies', description: '39 technical societies providing specialized communities of interest.' },
  { icon: 'public', title: 'Local Sections', description: 'Find a community near you through our global network of local branches.' },
];

export default function Membership() {
  return (
    <section className="py-20 md:py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 relative z-10">
        <div className="max-w-3xl mb-8 sm:mb-12 md:mb-16">
          <span className="section-label mb-4">Connect with Excellence</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 sm:mb-6 md:mb-8 leading-tight">Membership & Community</h2>
          <p className="text-base sm:text-lg md:text-xl text-on-surface-variant leading-relaxed">Join over 420,000 members in more than 160 countries who are building the future of technology and engineering.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {communityItems.map((item, index) => (
            <div key={index} className="flex flex-col gap-3 sm:gap-4">
              <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">{item.icon}</span>
              <h4 className="font-bold text-base sm:text-lg uppercase tracking-tight">{item.title}</h4>
              <p className="text-sm text-on-surface-variant">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 sm:mt-14 md:mt-20 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8" style={{ clipPath: 'polygon(0 0, 98% 0, 100% 15%, 100% 100%, 2% 100%, 0 85%)' }}>
          <div className="text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Ready to advance your career?</h3>
            <p className="text-sm sm:text-base opacity-80">IEEE membership provides resources and opportunities you can't find anywhere else.</p>
          </div>
          <Link to="/membership" className="text-primary px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-sm md:text-base font-bold tracking-widest uppercase hover:bg-secondary-fixed transition-all inline-block">
            Join IEEE Today
          </Link>
        </div>
      </div>
    </section>
  );
}