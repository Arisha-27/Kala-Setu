import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Search, Filter, MapPin, Star, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import ArtisanCard from "@/components/ArtisanCard";

interface ArtisanData {
  id: string;
  craft: string;
  specialization: string;
  bio: string;
  location: string;
  rating: number;
  followers: number;
  is_featured: boolean;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

const ArtisansPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCraft, setSelectedCraft] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [artisans, setArtisans] = useState<ArtisanData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('artisans')
          .select(`*, profiles (full_name, avatar_url)`);

        if (error) throw error;
        setArtisans(data || []);
      } catch (error) {
        console.error("Error fetching artisans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtisans();
  }, []);

  const crafts = ["All Crafts", "Pottery", "Handloom Weaving", "Silver Jewellery", "Wood Carving", "Block Printing", "Brass Work"];
  const states = ["All States", "Rajasthan", "Uttar Pradesh", "West Bengal", "Gujarat", "Karnataka", "Tamil Nadu"];

  const filteredArtisans = artisans.filter(artisan => {
    const name = artisan.profiles?.full_name || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.craft?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCraft = !selectedCraft || selectedCraft === "All Crafts" || artisan.craft === selectedCraft;
    const matchesState = !selectedState || selectedState === "All States" || artisan.location?.includes(selectedState);
    return matchesSearch && matchesCraft && matchesState;
  });

  if (loading) return <div className="pt-32 text-center text-muted-foreground">Loading Master Artisans...</div>;

  return (
    <div className="min-h-screen pt-8">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meet Our <span className="text-gradient-sunset">Master Artisans</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover talented craftspeople from across India, each preserving centuries-old traditions.
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search artisans..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedCraft} onValueChange={setSelectedCraft}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Select Craft" /></SelectTrigger>
                  <SelectContent>{crafts.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Select State" /></SelectTrigger>
                  <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="outline"><Filter className="h-4 w-4 mr-2" />More Filters</Button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-border/20">
              <p className="text-muted-foreground">Showing {filteredArtisans.length} artisans</p>
              <div className="flex items-center space-x-2">
                <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}><Grid3X3 className="h-4 w-4" /></Button>
                <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Artisans Display */}
      <section className="container mx-auto px-4 mb-16">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtisans.map((artisan) => (
              <div
                key={artisan.id}
                // 👇 FIXED: Added '/customer' prefix to match App router structure
                onClick={() => navigate(`/customer/artisan/${artisan.id}`)}
                className="cursor-pointer"
              >
                <ArtisanCard artisan={{
                  id: artisan.id,
                  name: artisan.profiles?.full_name || "Unknown Artisan",
                  image: artisan.profiles?.avatar_url || "https://placehold.co/400",
                  craft: artisan.craft,
                  specialization: artisan.specialization,
                  location: artisan.location || "India",
                  rating: artisan.rating || 0,
                  followers: artisan.followers || 0,
                  featured: artisan.is_featured,
                  bio: artisan.bio || "No bio available"
                }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredArtisans.map((artisan) => (
              <Card
                key={artisan.id}
                className="hover-lift transition-elegant group cursor-pointer"
                // 👇 FIXED: Added '/customer' prefix here too
                onClick={() => navigate(`/customer/artisan/${artisan.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                    <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={artisan.profiles?.avatar_url || "https://placehold.co/400"}
                        alt={artisan.profiles?.full_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{artisan.profiles?.full_name}</h3>
                          <p className="text-primary font-medium">{artisan.craft}</p>
                          <div className="flex items-center space-x-1 text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">{artisan.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span>{artisan.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">{artisan.bio || "No bio available."}</p>
                      <div className="flex space-x-3 pt-2">
                        <Button variant="default" size="sm">View Profile</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ArtisansPage;