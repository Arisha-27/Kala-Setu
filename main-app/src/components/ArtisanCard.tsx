import { Heart, MapPin, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ArtisanCardProps {
  artisan: {
    id: string;
    name: string;
    craft: string;
    location: string;
    image: string;
    rating: number;
    followers: number;
    specialization: string;
    featured: boolean;
    bio: string; // 👈 ADDED: This fixes the red line error in the parent file
  };
}

const ArtisanCard = ({ artisan }: ArtisanCardProps) => {
  return (
    <Card className="group overflow-hidden hover-lift transition-elegant border-border/50 h-full flex flex-col">
      <div className="relative">
        {/* Image Container */}
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={artisan.image}
            alt={artisan.name}
            className="w-full h-full object-cover transition-elegant group-hover:scale-105"
          />
        </div>
        
        {/* Featured Badge */}
        {artisan.featured && (
          <div className="absolute top-3 left-3">
            <span className="gradient-sunset text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
              Featured
            </span>
          </div>
        )}

        {/* Like Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm h-8 w-8 rounded-full"
        >
          <Heart className="h-4 w-4" />
        </Button>

        {/* Location Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
          <div className="flex items-center space-x-2 text-white/90 text-xs font-medium">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{artisan.location}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1 gap-3">
        {/* Header Info */}
        <div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {artisan.name}
          </h3>
          <p className="text-primary font-medium text-sm">{artisan.craft}</p>
        </div>

        {/* Bio Section (Added) */}
        <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
          {artisan.bio}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1 bg-secondary/30 px-2 py-1 rounded-sm">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{artisan.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{artisan.followers}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
          <Button variant="default" size="sm" className="flex-1 h-8 text-xs">
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtisanCard;