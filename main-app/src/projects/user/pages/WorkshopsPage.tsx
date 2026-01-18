import { useState, useEffect } from "react";
// 1. Ensure useNavigate is imported
import { useNavigate } from "react-router-dom"; 
import { Calendar, Clock, MapPin, Users, Star, Filter, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface Workshop {
  id: string;
  title: string;
  description: string;
  price: number;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  image_url: string | null;
  difficulty_level: string;
  profiles: {
    full_name: string;
  } | null;
}

const WorkshopsPage = () => {
  // 2. Initialize the hook
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('workshops')
          .select(`*, profiles (full_name)`)
          .order('date', { ascending: true });

        if (error) throw error;
        setWorkshops(data || []);
      } catch (error) {
        console.error("Error fetching workshops:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const getDuration = (start: string, end: string) => {
    if (!start || !end) return "";
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const date1 = new Date(0, 0, 0, h1, m1);
    const date2 = new Date(0, 0, 0, h2, m2);
    const diff = (date2.getTime() - date1.getTime()) / 1000 / 60 / 60;
    return `${Math.abs(diff)} hours`;
  };

  const filteredWorkshops = workshops.filter(workshop => {
    const instructorName = workshop.profiles?.full_name || "Unknown";
    const matchesSearch = workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory !== "all") {
       const textToCheck = (workshop.title + workshop.description).toLowerCase();
       const keyword = selectedCategory === 'textiles' ? 'weaving' : selectedCategory;
       matchesCategory = textToCheck.includes(keyword);
    }
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "pottery", name: "Pottery & Ceramics" },
    { id: "weaving", name: "Textiles & Weaving" },
    { id: "jewelry", name: "Jewelry Making" },
    { id: "painting", name: "Traditional Painting" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-background dark:to-muted/10 py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Learn from <span className="text-gradient-sunset">Master Artisans</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join hands-on workshops and master traditional crafts from India's finest artisans
            </p>
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search workshops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="whitespace-nowrap"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
             <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredWorkshops.map((workshop) => (
                <Card key={workshop.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-border/60">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={workshop.image_url || "https://placehold.co/600x400?text=Workshop"}
                      alt={workshop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-3 left-3 bg-white/90 text-foreground font-bold shadow-sm" variant="secondary">
                      {workshop.difficulty_level}
                    </Badge>
                    <Badge className="absolute top-3 right-3 bg-white text-foreground font-bold shadow-sm" variant="outline">
                      ₹{workshop.price}
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">{workshop.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground font-medium">by {workshop.profiles?.full_name || "Master Artisan"}</p>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            <span className="text-xs font-bold text-amber-700">4.9</span>
                        </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pb-4">
                    <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary/70" />
                            <span>{new Date(workshop.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary/70" />
                            <span>{getDuration(workshop.start_time, workshop.end_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <MapPin className="h-4 w-4 text-primary/70" />
                            <span className="truncate">{workshop.location}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <Users className="h-4 w-4 text-primary/70" />
                            <span>{workshop.current_participants}/{workshop.max_participants} enrolled</span>
                        </div>
                    </div>
                    
                    <p className="text-sm text-foreground/70 line-clamp-2 leading-relaxed border-t pt-3">
                      {workshop.description}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full font-semibold shadow-md"
                      // 👇 FIXED: Changed '/user' to '/customer' to match App.tsx
                      onClick={() => navigate(`/customer/workshop/${workshop.id}/book`)}
                    >
                      Book Workshop
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WorkshopsPage;