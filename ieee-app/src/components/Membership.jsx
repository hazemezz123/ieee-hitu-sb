import { Link } from 'react-router-dom';

const communityItems = [
  { icon: 'school', title: 'Student Programs', description: 'Resources and scholarships for the next generation of technical innovators.' },
  { icon: 'business_center', title: 'Career Center', description: 'Strategic tools and opportunities for professional growth at every career stage.' },
  { icon: 'diversity_3', title: 'Societies', description: '39 technical societies providing specialized communities of interest.' },
  { icon: 'public', title: 'Local Sections', description: 'Find a community near you through our global network of local branches.' },
];

export default function Membership() {
  return (
    <section className="py-24 bg-surface-container-lowest relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-surface-container opacity-50" style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }}></div>
      <div className="container mx-auto px-12 relative z-10">
        <div className="max-w-3xl mb-16">
          <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-tertiary block mb-4">Connect with Excellence</span>
          <h2 className="text-5xl font-black tracking-tighter mb-8 leading-tight">Membership & Community</h2>
          <p className="text-xl text-on-surface-variant leading-relaxed">Join over 420,000 members in more than 160 countries who are building the future of technology and engineering.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {communityItems.map((item, index) => (
            <div key={index} className="flex flex-col gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">{item.icon}</span>
              <h4 className="font-bold text-lg uppercase tracking-tight">{item.title}</h4>
              <p className="text-sm text-on-surface-variant">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-20 p-12 bg-primary text-on-primary flex flex-col md:flex-row justify-between items-center gap-8" style={{ clipPath: 'polygon(0 0, 98% 0, 100% 15%, 100% 100%, 2% 100%, 0 85%)' }}>
          <div>
            <h3 className="text-2xl font-bold mb-2">Ready to advance your career?</h3>
            <p className="opacity-80">IEEE membership provides resources and opportunities you can't find anywhere else.</p>
          </div>
          <Link to="/membership" className="bg-surface-container-lowest text-primary px-10 py-4 font-bold tracking-widest uppercase hover:bg-secondary-fixed transition-all inline-block">
            Join IEEE Today
          </Link>
        </div>
      </div>
    </section>
  );
}