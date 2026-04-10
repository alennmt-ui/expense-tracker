import { Sparkles, ArrowRight } from 'lucide-react';

interface OptimizationSuggestionProps {
  title?: string;
  description?: string;
  onClick?: () => void;
}

export default function OptimizationSuggestion({ title, description, onClick }: OptimizationSuggestionProps) {
  const defaultTitle = "Optimization Suggestion";
  const defaultDescription = "Click to view personalized financial insights and recommendations.";

  return (
    <div 
      onClick={onClick}
      className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface">{title || defaultTitle}</h4>
          <p className="text-xs text-on-surface-variant">{description || defaultDescription}</p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-primary" />
    </div>
  );
}
