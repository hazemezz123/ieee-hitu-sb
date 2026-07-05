import logo from "../assets/logo.png";
import ScrollIndicator from "./ScrollIndicator";
import { motion, useScroll, useTransform } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export default function Hero() {
  const { scrollY } = useScroll()
  const Motion = motion

  const contentY = useTransform(scrollY, [0, 600], [0, 30])
  const fadeOut = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">

      <div
        className="flex-1 flex items-center justify-center w-full relative z-10 pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-16"
        style={{ y: contentY, opacity: fadeOut }}
      >
        <div className="container mx-auto px-6 sm:px-8 md:px-12 max-w-4xl text-center">
          <Motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 md:space-y-8 lg:space-y-10"
          >
            <Motion.div variants={fadeUp} className="flex justify-center">
              <div className="px-4 py-3 md:px-6 md:py-4">
                <img
                  src={logo}
                  alt="IEEE HITU Student Branch logo"
                  className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto animate-[logo-float_8s_ease-in-out_infinite] brightness-0 invert"
                />
              </div>
            </Motion.div>

            <Motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#F0F4F8] leading-[1.05]"
            >
              Beyond Labels. <br />
              <span className="text-[#7BAED4]">Beyond Limits.</span>
            </Motion.h1>

            <Motion.p
              variants={fadeUp}
              className="text-sm sm:text-base md:text-lg text-[#9BA9B4] max-w-2xl mx-auto leading-relaxed"
            >
              The official student branch of IEEE at Heliopolis International
              Technological University — connecting students to a global community
              of engineers, innovators, and problem-solvers.
            </Motion.p>

            <Motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center"
            >
              <button className="inline-flex items-center justify-center h-11 px-6 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[#7BAED4] text-[#05070B] transition-all duration-250 hover:bg-[#98CBFF] cursor-pointer select-none whitespace-nowrap border-none no-underline leading-none animate-[button-float_10s_ease-in-out_infinite]">
                Explore Standards
              </button>
              <button className="inline-flex items-center justify-center h-11 px-6 rounded-2xl font-bold text-sm uppercase tracking-wide bg-transparent text-[#7BAED4] border border-[#7BAED4]/30 transition-all duration-250 hover:border-[#7BAED4] cursor-pointer select-none whitespace-nowrap no-underline leading-none animate-[button-float_12s_ease-in-out_infinite_1s]">
                Learn More
              </button>
            </Motion.div>

          </Motion.div>
        </div>
      </div>

      <Motion.div style={{ opacity: fadeOut }}>
        <ScrollIndicator />
      </Motion.div>

      <div data-next-section />
    </section>
  );
}
