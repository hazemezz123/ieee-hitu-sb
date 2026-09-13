import {
  Blocks,
  Bot,
  Brain,
  Camera,
  CircuitBoard,
  Code2,
  Crosshair,
  Database,
  Globe,
  GraduationCap,
  Megaphone,
  Shield,
  TrendingUp,
  Workflow,
} from 'lucide-react'

const icons = {
  ai: Brain,
  'cyber-defensive': Shield,
  'cyber-offensive': Crosshair,
  web: Globe,
  automations: Workflow,
  robotics: Bot,
  embedded: CircuitBoard,
  'pr-oc': Megaphone,
  'multi-media': Camera,
  marketing: TrendingUp,
  'hr-td': GraduationCap,
  cs: Code2,
  ds: Database,
}

export default function CommitteeIcon({ slug, className = '' }) {
  const Icon = icons[slug] || Blocks
  return <Icon className={className} aria-hidden="true" strokeWidth={2} />
}