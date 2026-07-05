import logo from "../assets/logo.png";
import { useTheme } from "../theme/useTheme";
import DotField from "./DotField";
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

function DecorativeShapes() {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute top-[15%] right-[8%] w-16 h-16 rounded-full border border-primary/10 animate-[shape-drift-1_20s_ease-in-out_infinite]"
      />
      <div
        className="absolute bottom-[25%] left-[5%] w-8 h-8 rotate-45 border border-primary/8 animate-[shape-drift-2_25s_ease-in-out_infinite]"
      />
      <div
        className="absolute top-[40%] right-[3%] w-px h-20 bg-primary/8 animate-[shape-drift-3_18s_ease-in-out_infinite]"
      />
      <div
        className="absolute bottom-[15%] right-[20%] w-3 h-3 rounded-full bg-primary/6 animate-[shape-drift-1_22s_ease-in-out_infinite_1s]"
      />
      <div
        className="absolute top-[60%] left-[10%] w-24 h-px bg-primary/6 animate-[shape-drift-2_28s_ease-in-out_infinite_2s]"
      />
    </div>
  )
}

export default function Hero() {
  const { theme } = useTheme();
  const { scrollY } = useScroll()
  const Motion = motion

  const bgY = useTransform(scrollY, [0, 600], [0, -80])
  const contentY = useTransform(scrollY, [0, 600], [0, 30])
  const shapesY = useTransform(scrollY, [0, 600], [0, -120])
  const fadeOut = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-surface-container-lowest">
      <Motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <DotField />
      </Motion.div>
      <Motion.div className="absolute inset-0 z-[1]" style={{ y: shapesY }} aria-hidden="true">
        <DecorativeShapes />
      </Motion.div>
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent"
          style={{ transform: "rotate(0deg) scale(1.5)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-secondary-container wedge-accent"
          style={{ transform: "rotate(180deg) scale(1.2)" }}
        />
      </div>

      <Motion.div className="flex-1 flex items-center justify-center w-full relative z-10 pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-16" style={{ y: contentY, opacity: fadeOut }}>
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
                  className={`h-20 sm:h-24 md:h-28 lg:h-32 w-auto animate-[logo-float_8s_ease-in-out_infinite] transition-[filter] duration-200 ${theme === "dark" ? "brightness-0 invert" : ""}`}
                />
              </div>
            </Motion.div>

            <Motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-on-surface leading-[1.05]"
            >
              Beyond Labels. <br />
              <span className="text-primary">Beyond Limits.</span>
            </Motion.h1>

            <Motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center"
            >
              <button className="btn btn-primary animate-[button-float_10s_ease-in-out_infinite]">
                Explore Standards
              </button>
              <button className="btn btn-secondary animate-[button-float_12s_ease-in-out_infinite_1s]">
                Learn More
              </button>
            </Motion.div>

          </Motion.div>
        </div>
      </Motion.div>

      <Motion.div style={{ opacity: fadeOut }}>
        <ScrollIndicator />
      </Motion.div>

      <div data-next-section />
    </section>
  );
}
