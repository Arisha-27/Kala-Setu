import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Sparkles, Users, Award, Globe, Loader2, Calendar, Clock, MapPin } from "lucide-react";
import ImageSlider from "@/components/ImageSlider";
import ArtisanCard from "@/components/ArtisanCard";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Fallback images
import potteryImage from "@/assets/artisan-pottery.jpg";
import workshopImage from "@/assets/artisan-woodwork.jpg";

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [featuredArtisans, setFeaturedArtisans] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // --- 1. Fetch Real Artisans ---
        const { data: artisansData } = await supabase.from('artisans').select('*').limit(4);

        if (artisansData) {
          const profileIds = artisansData.map(a => a.id);
          const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', profileIds);

          const mappedArtisans = artisansData.map((a: any) => {
            const profile = profiles?.find(p => p.id === a.id);
            return {
              id: a.id,
              name: profile?.full_name || "Artisan",
              craft: a.craft || "Handicraft",
              location: a.location || "India",
              image: profile?.avatar_url || potteryImage,
              rating: a.rating || 4.8,
              followers: a.followers || 150,
              specialization: a.specialization || "Master Craftsman",
              featured: a.is_featured || false,
              bio: a.bio
            };
          });
          setFeaturedArtisans(mappedArtisans);
        }

        // --- 2. Fetch Real Products ---
        const { data: productsData } = await supabase.from('products').select('*').limit(4);

        if (productsData) {
          const mappedProducts = productsData.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.price * 1.2,
            image: p.image_url || potteryImage,
            artisan: "Master Artisan",
            craft: p.category || "Handicraft",
            rating: 4.8,
            reviews: 12,
            inStock: p.stock > 0,
            featured: false
          }));
          setProducts(mappedProducts);
        }

        // --- 3. Fetch Workshops ---
        const { data: rawWorkshops, error: wsError } = await supabase
          .from('workshops')
          .select('*')
          .limit(4);

        if (wsError) throw wsError;

        if (rawWorkshops && rawWorkshops.length > 0) {
          const artisanIds = [...new Set(rawWorkshops.map(w => w.artisan_id).filter(Boolean))];
          let artisansMap: Record<string, string> = {};

          if (artisanIds.length > 0) {
            const { data: artisanNames } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', artisanIds);

            artisanNames?.forEach(a => artisansMap[a.id] = a.full_name);
          }

          const mappedWorkshops = rawWorkshops.map(w => ({
            ...w,
            artisan_name: artisansMap[w.artisan_id] || "Master Artisan",
            image: w.image_url || workshopImage
          }));

          setWorkshops(mappedWorkshops);
        }

      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { icon: Users, label: "Artisans", value: "2,500+" },
    { icon: Sparkles, label: "Unique Crafts", value: "50,000+" },
    { icon: Award, label: "Happy Customers", value: "25,000+" },
    { icon: Globe, label: "States Covered", value: "28" }
  ];

  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-8">
        <ImageSlider />
      </section>

      {/* Stats */}
      <section className="py-16 gradient-warm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 gradient-sunset rounded-full flex items-center justify-center">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{stat.value}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artisans */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Featured <span className="text-gradient-sunset">Artisans</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Meet the master craftspeople preserving India's traditional arts.
              </p>
            </div>
            <Button variant="default" size="lg" className="mt-4 md:mt-0" onClick={() => navigate('/customer/artisans')}>
              View All Artisans
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? <Loader2 className="animate-spin mx-auto col-span-full" /> :
              featuredArtisans.length > 0 ? (
                featuredArtisans.map((artisan) => (
                  <div key={artisan.id} className="cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate(`/customer/artisan/${artisan.id}`)}>
                    <ArtisanCard artisan={artisan} />
                  </div>
                ))
              ) : <p className="col-span-full text-center text-muted-foreground">No featured artisans found.</p>
            }
          </div>
        </div>
      </section>

      {/* Handpicked Treasures */}
      <section className="py-16 gradient-warm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Handpicked <span className="text-gradient-craft">Treasures</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Discover unique handcrafted items made with love.
              </p>
            </div>
            <Button variant="default" size="lg" className="mt-4 md:mt-0" onClick={() => navigate('/customer/collections')}>
              Explore Collection
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? <Loader2 className="animate-spin mx-auto col-span-full" /> :
              products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate(`/customer/product/${product.id}`)}>
                    <ProductCard product={product} />
                  </div>
                ))
              ) : <p className="col-span-full text-center text-muted-foreground">No products found.</p>
            }
          </div>
        </div>
      </section>

      {/* Live Workshops */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Join Live <span className="text-gradient-sunset">Workshops</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Learn directly from master artisans. Book a session to experience the craft firsthand.
              </p>
            </div>
            <Button variant="default" size="lg" className="mt-4 md:mt-0" onClick={() => navigate('/customer/workshops')}>
              View All Workshops
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <Loader2 className="animate-spin mx-auto col-span-full" />
            ) : workshops.length > 0 ? (
              workshops.map((workshop) => (
                <Card
                  key={workshop.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200 bg-white"
                  onClick={() => navigate(`/customer/workshop/${workshop.id}/book`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={workshop.image || workshopImage}
                      alt={workshop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur-sm border-0">
                        {workshop.difficulty || "Beginner"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {workshop.title}
                    </h3>

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span className="truncate">by {workshop.artisan_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span>{workshop.date ? new Date(workshop.date).toLocaleDateString() : 'Upcoming'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>{workshop.duration || 60} mins</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xl font-bold text-slate-900">₹{workshop.price}</span>
                      <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 font-semibold">
                        Book Now →
                      </Button>
                    </div>

                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 mb-4">No upcoming workshops scheduled right now.</p>
                <Button variant="outline" onClick={() => navigate('/customer/workshops')}>View All Listings</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-sunset">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Our Community of Craft Lovers
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {/* 👇 FIX: Replaced 'variant=glass' with explicit classes */}
            <Button
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm h-12 px-8"
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Become a Member
            </Button>

            {/* 👇 FIX: Replaced 'variant=golden' with explicit classes */}
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 h-12 px-8"
              size="lg"
              onClick={() => navigate('/customer/workshops')}
            >
              Join Workshops
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;