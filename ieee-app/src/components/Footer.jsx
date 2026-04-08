export default function Footer() {
  return (
    <footer className="bg-[#0f172a] w-full pt-16 pb-8 border-t-4 border-primary" style={{ clipPath: 'polygon(0 0, 100% 15%, 100% 100%, 0 100%)' }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 max-w-7xl mx-auto">
        <div className="col-span-1 md:col-span-1">
          <div className="text-lg font-bold text-white mb-6">IEEE</div>
          <p className="text-slate-500 text-xs tracking-widest uppercase font-medium leading-relaxed mb-6">The world's largest technical professional organization dedicated to advancing technology for the benefit of humanity.</p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-blue-400 cursor-pointer hover:text-white transition-colors">share</span>
            <span className="material-symbols-outlined text-blue-400 cursor-pointer hover:text-white transition-colors">rss_feed</span>
          </div>
        </div>
        <div className="space-y-4">
          <h5 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-6">Quick Links</h5>
          <ul className="space-y-3">
            <li><a className="text-xs tracking-widest uppercase font-medium text-slate-500 hover:text-blue-300 hover:translate-x-1 transition-transform block" href="#">About IEEE</a></li>
            <li><a className="text-xs tracking-widest uppercase font-medium text-slate-500 hover:text-blue-300 hover:translate-x-1 transition-transform block" href="#">Contact & Support</a></li>
            <li><a className="text-xs tracking-widest uppercase font-medium text-slate-500 hover:text-blue-300 hover:translate-x-1 transition-transform block" href="#">Careers</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-6">Legal</h5>
          <ul className="space-y-3">
            <li><a className="text-xs tracking-widest uppercase font-medium text-slate-500 hover:text-blue-300 hover:translate-x-1 transition-transform block" href="#">Privacy Policy</a></li>
            <li><a className="text-xs tracking-widest uppercase font-medium text-slate-500 hover:text-blue-300 hover:translate-x-1 transition-transform block" href="#">Terms & Conditions</a></li>
            <li><a className="text-xs tracking-widest uppercase font-medium text-slate-500 hover:text-blue-300 hover:translate-x-1 transition-transform block" href="#">Accessibility</a></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h5 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-6">Newsletter</h5>
          <div className="relative">
            <input 
              className="w-full bg-slate-900 border-none text-white text-xs p-4 focus:ring-1 focus:ring-blue-400 outline-none" 
              placeholder="Email Address" 
              type="email" 
            />
            <button className="absolute right-2 top-2 bottom-2 bg-primary text-white px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-primary-container transition-colors">
              Submit
            </button>
          </div>
          <p className="text-slate-600 text-[10px] uppercase tracking-tighter">Stay updated with the latest in technology.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-12 mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 opacity-80">
        <p className="text-[10px] tracking-widest uppercase font-medium text-slate-500">© 2024 IEEE – The world's largest technical professional organization dedicated to advancing technology for the benefit of humanity.</p>
        <div className="flex gap-8">
          <span className="text-blue-400 text-[10px] tracking-widest uppercase font-bold">New Jersey, USA</span>
        </div>
      </div>
    </footer>
  );
}