const variants = {
  dots: (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-[15%] right-[8%] w-12 h-12 rounded-full border border-primary/8 animate-[shape-drift-1_20s_ease-in-out_infinite]" />
      <div className="absolute bottom-[20%] left-[5%] w-6 h-6 rotate-45 border border-primary/6 animate-[shape-drift-2_25s_ease-in-out_infinite]" />
    </div>
  ),
  lines: (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-[30%] right-[3%] w-px h-16 bg-primary/6 animate-[shape-drift-3_18s_ease-in-out_infinite]" />
      <div className="absolute bottom-[30%] left-[10%] w-20 h-px bg-primary/5 animate-[shape-drift-2_22s_ease-in-out_infinite_1s]" />
    </div>
  ),
  grid: (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute top-[10%] right-[5%] w-24 h-24 opacity-[0.03]"
        style={{
          backgroundImage: [
            'linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)',
            'linear-gradient(0deg, var(--color-primary) 1px, transparent 1px)',
          ].join(','),
          backgroundSize: '16px 16px',
        }}
      />
    </div>
  ),
}

export default function SectionDecorations({ variant = 'dots' }) {
  return variants[variant] || null;
}
