import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ArtisanCard from "@/components/ArtisanCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Fallback images
import potteryImage from "@/assets/artisan-pottery.jpg";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [artisans, setArtisans] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        // --- 1. Search Products ---
        const { data: prodData } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(10);

        if (prodData && prodData.length > 0) {
          // Fetch Artisan Names for these products
          const artisanIds = [...new Set(prodData.map(p => p.artisan_id).filter(Boolean))];
          let nameMap: Record<string, string> = {};

          if (artisanIds.length > 0) {
            const { data: names } = await supabase.from('profiles').select('id, full_name').in('id', artisanIds);
            names?.forEach(n => nameMap[n.id] = n.full_name);
          }

          // 👇 MAPPING FIX: Correctly maps DB fields to UI props
          setProducts(prodData.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            // Set originalPrice to null so NO discount badge shows
            originalPrice: null,
            image: p.image_url || potteryImage, // Fallback if URL is empty
            artisan: nameMap[p.artisan_id] || "Master Artisan",
            craft: p.category || "Handicraft",
            rating: 4.8,
            reviews: 12,
            inStock: p.stock > 0, // ✅ Correct Logic: Show item if stock > 0
            featured: false
          })));
        } else {
          setProducts([]);
        }

        // --- 2. Search Artisans ---
        const { data: artData } = await supabase
          .from('artisans')
          .select('*')
          .or(`craft.ilike.%${query}%, location.ilike.%${query}%`)
          .limit(10);

        if (artData && artData.length > 0) {
          const profileIds = artData.map(a => a.id);
          const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', profileIds);

          setArtisans(artData.map((a: any) => {
            const profile = profiles?.find(p => p.id === a.id);
            return {
              id: a.id,
              name: profile?.full_name || "Artisan",
              craft: a.craft,
              location: a.location,
              image: profile?.avatar_url || potteryImage,
              rating: a.rating || 4.8,
              followers: a.followers || 100,
              specialization: a.specialization || "Craftsman"
            };
          }));
        } else {
          setArtisans([]);
        }

        // --- 3. Search Workshops ---
        const { data: wsData } = await supabase
          .from('workshops')
          .select('*')
          .ilike('title', `%${query}%`)
          .limit(10);

        setWorkshops(wsData || []);

      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Search results for "<span className="text-orange-600">{query}</span>"
        </h1>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
        ) : (
          <div className="space-y-16">

            {/* Products Section */}
            {products.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6 text-slate-800">Products found</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map(p => (
                    <div
                      key={p.id}
                      className="cursor-pointer transition-transform hover:scale-[1.02]"
                      onClick={() => navigate(`/customer/product/${p.id}`)}
                    >
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Artisans Section */}
            {artisans.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6 text-slate-800">Artisans found</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {artisans.map(a => (
                    <div
                      key={a.id}
                      className="cursor-pointer transition-transform hover:scale-[1.02]"
                      onClick={() => navigate(`/customer/artisan/${a.id}`)}
                    >
                      <ArtisanCard artisan={a} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Workshops Section */}
            {workshops.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6 text-slate-800">Workshops found</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {workshops.map(w => (
                    <Card
                      key={w.id}
                      className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200 bg-white"
                      onClick={() => navigate(`/customer/workshop/${w.id}/book`)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={w.image_url || potteryImage}
                          alt={w.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur-sm border-0">
                            {w.difficulty || "All Levels"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{w.title}</h3>
                        <p className="text-sm text-slate-500 mb-3">
                          {w.duration} mins • ₹{w.price}
                        </p>
                        <Button size="sm" variant="outline" className="w-full">View Details</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {products.length === 0 && artisans.length === 0 && workshops.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-lg mb-2">No results found for "{query}".</p>
                <p className="text-slate-400">Try checking your spelling or using broader keywords like "pottery", "saree", or "wood".</p>
                <Button variant="link" onClick={() => navigate('/customer')} className="mt-4 text-orange-600">
                  Go back to Discover
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}