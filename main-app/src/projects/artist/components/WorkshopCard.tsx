import { Calendar, Clock, MapPin, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WorkshopProps {
  workshop: {
    id: string;
    title: string;
    artisan_name: string;
    rating: number;
    image_url: string;
    price: number;
    date: string;       // "2024-03-15"
    start_time: string; // "10:00:00"
    end_time: string;   // "16:00:00"
    duration_hours: number;
    location: string;
    current_participants: number;
    max_participants: number;
    difficulty_level: string;
  };
}

const WorkshopCard = ({ workshop }: WorkshopProps) => {
  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper to format time (e.g. 10:00:00 -> 10:00 AM)
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <Card className="hover-lift transition-all duration-300 group overflow-hidden border-border/50">
      {/* Image Header */}
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img
          src={workshop.image_url || "https://placehold.co/600x400"}
          alt={workshop.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-foreground font-medium shadow-sm">
            {workshop.difficulty_level}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className="bg-white text-foreground font-bold shadow-sm">
            ₹{workshop.price}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Title & Artisan */}
        <div>
          <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {workshop.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">by {workshop.artisan_name}</span>
            <div className="flex items-center text-xs font-medium focus-visible:ring-purple-500 bg-amber-50 px-1.5 py-0.5 rounded">
              <Star className="w-3 h-3 fill-current mr-1" />
              {workshop.rating}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{formatDate(workshop.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>
              {formatTime(workshop.start_time)} - {formatTime(workshop.end_time)} ({workshop.duration_hours} hours)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="truncate">{workshop.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>
              {workshop.current_participants}/{workshop.max_participants} participants
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full mt-2" variant="outline">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkshopCard;