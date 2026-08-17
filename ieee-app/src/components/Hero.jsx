import logo from '../assets/logo.png'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-inverse-surface">
      <div
        className="flex-1 flex items-center justify-center w-full relative z-10 pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-16"
      >
        <div className="container mx-auto px-6 sm:px-8 md:px-12 max-w-4xl text-center">
          <div className="space-y-6 md:space-y-8 lg:space-y-10">
            <div className="flex justify-center">
              <div className="px-4 py-3 md:px-6 md:py-4">
                <img
                  src={logo}
                  alt="IEEE HITU Student Branch logo"
                  className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto brightness-0 invert"
                />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#F0F4F8] leading-[1.05]">
              Beyond Labels. <br />
              <span className="text-[#7BAED4]">Beyond Limits.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#9BA9B4] max-w-2xl mx-auto leading-relaxed">
              The official student branch of IEEE at Heliopolis International
              Technological University — connecting students to a global community
              of engineers, innovators, and problem-solvers.
            </p>

          </div>
        </div>
      </div>
      <div data-next-section />
    </section>
  )
}
