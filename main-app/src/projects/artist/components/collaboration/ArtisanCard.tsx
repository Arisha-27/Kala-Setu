import { Heart, Eye, MessageCircle, BadgeCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ArtisanCard = ({ artisan }: any) => {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative group">
      <button
        className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"
        aria-label="Add to favorites"
        title="Add to favorites"
      >
        <Heart size={22} />
      </button>

      <div className="flex flex-col items-center text-center mb-5">
        <div className="relative mb-3">
          <img
            src={artisan.profiles?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"}
            className="w-20 h-20 rounded-full border-2 border-purple-100 object-cover"
            alt={artisan.profiles?.full_name}
          />
          <BadgeCheck size={18} className="absolute bottom-0 right-0 text-purple-600 fill-white" />
        </div>
        <h3 className="font-bold text-gray-900 text-lg">{artisan.profiles?.full_name}</h3>
        <span className="text-[10px] bg-purple-50 text-purple-600 font-bold px-3 py-1 rounded-full uppercase mt-1 tracking-wider">
          {artisan.craft}
        </span>
      </div>

      <p className="text-sm text-gray-500 text-center line-clamp-2 italic mb-6">
        "{artisan.bio}"
      </p>

      <div className="flex justify-around items-center py-4 border-t border-gray-50 mb-6">
        <div className="text-center">
          <div className="flex items-center gap-1 text-gray-900 font-bold"><Star size={14} className="fill-yellow-400 text-yellow-400" />{artisan.rating}</div>
          <p className="text-[10px] text-gray-400">RATING</p>
        </div>
        <div className="text-center">
          <div className="text-gray-900 font-bold">{artisan.years_experience || 0}+</div>
          <p className="text-[10px] text-gray-400">EXP</p>
        </div>
        <div className="text-center">
          <div className="text-gray-900 font-bold">{artisan.project_count || 0}</div>
          <p className="text-[10px] text-gray-400">PROJECTS</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 rounded-2xl h-12 border-gray-200 font-semibold gap-2">
          <MessageCircle size={18} /> Contact
        </Button>
        <Button variant="secondary" size="icon" className="rounded-2xl h-12 w-12 bg-gray-50">
          <Eye size={20} className="text-gray-400" />
        </Button>
      </div>
    </div>
  );
};