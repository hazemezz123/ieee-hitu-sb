const resources = [
  {
    icon: 'menu_book',
    title: 'IEEE Xplore®',
    description: "Access more than 5 million documents from some of the world most highly cited publications in electrical engineering and computer science.",
    link: 'Access Digital Library',
  },
  {
    icon: 'settings_input_component',
    title: 'Standards',
    description: 'Developing technology standards that provide the basis for new products and services in areas such as smart grid, IoT, and telecommunications.',
    link: 'Browse Catalog',
  },
  {
    icon: 'groups',
    title: 'Conferences',
    description: 'Bringing together technical professionals from around the world to share the latest research and network with industry leaders.',
    link: 'View Calendar',
  },
];

export default function TechnicalResources() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-surface">
      <div className="container mx-auto px-6 sm:px-8 md:px-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 sm:mb-12 md:mb-16 gap-4 sm:gap-0">
          <div>
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-3 sm:mb-4">Core Ecosystem</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">Technical Resources</h2>
          </div>
          <div className="h-1 w-24 sm:w-28 md:w-32 bg-primary-container"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {resources.map((item, index) => (
            <div
              key={index}
              className="bg-surface-container-low p-6 sm:p-8 md:p-10 group hover:bg-surface-container-lowest transition-all duration-300 relative overflow-hidden"
            >
              <div className="mb-6 sm:mb-8 text-primary">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">{item.icon}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{item.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-4 sm:mb-6">{item.description}</p>
              <a className="inline-flex items-center text-primary font-bold text-xs tracking-widest uppercase hover:translate-x-2 transition-transform" href="#">
                {item.link} <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
              </a>
              <div className="absolute bottom-0 right-0 w-12 h-12 bg-primary/5 wedge-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}