import { Award, CalendarCheck, Flame, Languages, Layers, Sparkles, Swords, Trophy, Type } from "lucide-react";

const MAP = {
  sparkles: Sparkles,
  type: Type,
  flame: Flame,
  calendar: CalendarCheck,
  swords: Swords,
  languages: Languages,
  layers: Layers,
  trophy: Trophy,
};

export default function BadgeIcon({ name, className = "h-5 w-5" }) {
  const Icon = MAP[name] ?? Award;
  return <Icon className={className} strokeWidth={1.7} />;
}