
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Car, 
  Home, 
  Cpu, 
  Building2, 
  Heart, 
  Landmark, 
  Scale, 
  PenTool, 
  MoreHorizontal 
} from 'lucide-react';

interface CategorySelectorProps {
  categories: string[];
  onSelectCategory: (category: string) => void;
  selectedCategory: string | null;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  categories, 
  onSelectCategory, 
  selectedCategory 
}) => {
  // Function to get icon for each category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'automobile':
        return <Car size={20} />;
      case 'housing':
        return <Home size={20} />;
      case 'it':
        return <Cpu size={20} />;
      case 'industrial':
      case 'legal':
        return <Scale size={20} />;
      case 'healthcare':
      case 'medical':
        return <Heart size={20} />;
      case 'finance':
        return <Landmark size={20} />;
      case 'education':
        return <PenTool size={20} />;
      default:
        return <MoreHorizontal size={20} />;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={cn(
            "px-6 py-4 rounded-2xl transition-all duration-300",
            "backdrop-blur-sm border border-white/10",
            "group hover:border-[#00ffd5]/50 hover:shadow-[0_0_15px_rgba(0,255,213,0.3)]",
            selectedCategory === category
              ? "bg-[#00ffd5]/10 border-[#00ffd5] text-[#00ffd5] shadow-[0_0_15px_rgba(0,255,213,0.2)]"
              : "bg-black/30 text-gray-300"
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <span className={cn(
              "p-2 rounded-full",
              selectedCategory === category
                ? "bg-[#00ffd5]/20 text-[#00ffd5]"
                : "bg-white/5 text-gray-400 group-hover:text-[#00ffd5]/80 group-hover:bg-[#00ffd5]/10"
            )}>
              {getCategoryIcon(category)}
            </span>
            {category}
          </div>
        </button>
      ))}
    </div>
  );
};
