import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MapPin, Star, Share2, MessageCircle, Package, ArrowLeft, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description: string;
}

interface ArtisanData {
  id: string;
  craft: string;
  specialization: string;
  bio: string;
  location: string;
  rating: number;
  followers: number;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

const ArtisanProfile = () => {
  const { id } = useParams(); // Artisan's ID
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState<ArtisanData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    const fetchProfileAndProducts = async () => {
      if (!id) return;
      setLoading(true);

      try {
        // A. Fetch Artisan Details
        const { data: artisanData, error: artisanError } = await supabase
          .from("artisans")
          .select(`*, profiles (full_name, avatar_url)`)
          .eq("id", id)
          .single();

        if (artisanError) throw artisanError;
        setArtisan(artisanData);

        // B. Fetch Products
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("artisan_id", id);

        if (productError) throw productError;
        setProducts(productData || []);

      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndProducts();
  }, [id]);

  // 👇 NEW: Handle "Contact Artisan" Click - OPENS WIDGET
  const handleContactArtisan = async () => {
    if (!id) return;
    setContacting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in to contact this artisan.");
        return;
      }

      if (user.id === id) {
        alert("You cannot message yourself!");
        return;
      }

      // Check for existing conversation to prepopulate widget
      let chatId = null;
      const { data: existingChats } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${id}),and(participant1_id.eq.${id},participant2_id.eq.${user.id})`);

      if (existingChats && existingChats.length > 0) {
        chatId = existingChats[0].id;
      } else {
        // Create new conversation
        const { data: newChat, error } = await supabase
          .from('conversations')
          .insert({
            participant1_id: user.id,
            participant2_id: id
          })
          .select()
          .single();

        if (!error && newChat) chatId = newChat.id;
      }

      // 🔥 DISPATCH EVENT TO OPEN WIDGET
      const event = new CustomEvent('OPEN_CHAT', {
        detail: { artisanId: id, chatId: chatId }
      });
      window.dispatchEvent(event);

    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Could not start conversation.");
    } finally {
      setContacting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin" /></div>;
  if (!artisan) return <div className="min-h-screen flex items-center justify-center pt-20">Artisan not found</div>;

  return (
    <div className="min-h-screen bg-background pb-12 pt-24">

      <div className="container mx-auto px-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Artisans
        </Button>
      </div>

      {/* Artisan Header */}
      <div className="container mx-auto px-4 mb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-border/50 p-8 md:p-12">
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">

            {/* Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl shrink-0">
              <img
                src={artisan.profiles?.avatar_url || "https://placehold.co/400"}
                alt={artisan.profiles?.full_name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{artisan.profiles?.full_name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-muted-foreground">
                  <Badge variant="secondary" className="px-3 py-1 text-sm bg-white/50 backdrop-blur-sm">
                    {artisan.craft}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{artisan.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-amber-500 font-medium">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{artisan.rating}</span>
                    <span className="text-muted-foreground ml-1">({artisan.followers} followers)</span>
                  </div>
                </div>
              </div>

              <p className="text-lg text-foreground/80 max-w-2xl leading-relaxed">
                {artisan.bio || "Preserving traditional Indian crafts through dedication and skill."}
              </p>

              <div className="flex justify-center md:justify-start gap-3 pt-2">

                {/* 👇 UPDATED BUTTON */}
                <Button
                  onClick={handleContactArtisan}
                  disabled={contacting}
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20"
                >
                  {contacting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" />
                  )}
                  Contact Artisan
                </Button>

                <Button variant="outline" className="bg-white/50">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Crafted Collection
            <span className="text-muted-foreground text-lg font-normal ml-2">({products.length})</span>
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No products listed yet</h3>
            <p className="text-muted-foreground">Check back later for new creations from this artisan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-border/50"
                onClick={() => navigate(`/customer/product/${product.id}`)}
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                  <img
                    src={product.image_url || "https://placehold.co/400"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-border/40 pt-3">
                    <span className="font-bold text-xl">₹{product.price}</span>
                    <Button size="sm" variant="ghost" className="text-xs h-8">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanProfile;