import type { LucideIcon } from 'lucide-react'
import {
  Banknote,
  Briefcase,
  Car,
  ClipboardList,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Lightbulb,
  Plane,
  Repeat,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react'

const categoryIcons: Record<string, LucideIcon> = {
  'Food & Dining': UtensilsCrossed,
  Transportation: Car,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Healthcare: HeartPulse,
  Utilities: Lightbulb,
  Housing: Home,
  Education: GraduationCap,
  Travel: Plane,
  Insurance: ShieldCheck,
  Investment: TrendingUp,
  Salary: Banknote,
  Freelance: Briefcase,
  Gifts: Gift,
  Subscriptions: Repeat,
  Other: ClipboardList,
}

export function getCategoryIconComponent(category?: string): LucideIcon {
  if (!category) {
    return ClipboardList
  }
  return categoryIcons[category] ?? ClipboardList
}
