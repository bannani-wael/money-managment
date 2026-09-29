import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Briefcase,
  Car,
  Clapperboard,
  Gift,
  HeartPulse,
  Home,
  Laptop,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  TrendingUp,
  User,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: UtensilsCrossed,
  car: Car,
  bag: ShoppingBag,
  bolt: Zap,
  home: Home,
  heart: HeartPulse,
  film: Clapperboard,
  book: BookOpen,
  user: User,
  dots: MoreHorizontal,
  briefcase: Briefcase,
  laptop: Laptop,
  trend: TrendingUp,
  gift: Gift,
  plus: Plus,
}

export function CategoryGlyph({
  icon,
  color,
  size = 18,
}: {
  icon: string
  color: string
  size?: number
}) {
  const Icon = CATEGORY_ICONS[icon] ?? MoreHorizontal
  return (
    <span
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl"
      style={{ background: `${color}22`, color }}
    >
      <Icon size={size} strokeWidth={2} />
    </span>
  )
}
