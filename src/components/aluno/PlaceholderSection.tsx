import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const PlaceholderSection = ({ icon: Icon, title, description }: Props) => (
  <div className="mt-8 rounded-xl p-8 bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/50 text-center">
    <Icon className="w-12 h-12 text-pixelyellow mx-auto mb-3" />
    <h2 className="font-display text-2xl uppercase text-pixelyellow mb-2">{title}</h2>
    <p className="font-body text-white/80 max-w-2xl mx-auto">{description}</p>
  </div>
);
