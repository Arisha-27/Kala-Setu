import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CollectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 1. Fetch Collection Info
      const { data: collData } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();
      setCollection(collData);

      // 2. Fetch Products (For demo, we fetch ALL. In real app, filter by collection_id)
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .limit(8); 
      setProducts(prodData || []);
      
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600" /></div>;

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      {/* Hero Header */}
      <div className="relative h-[400px] bg-slate-900">
        <img 
          src={collection?.image_url} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 container mx-auto">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white flex items-center mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collections
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{collection?.title}</h1>
          <p className="text-xl text-white/90 max-w-2xl">{collection?.description}</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Collection Items</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden"
              onClick={() => navigate(`/customer/product/${product.id}`)} // 👈 LINK TO ORDER PAGE
            >
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  <Button size="sm" className="bg-white text-slate-900 hover:bg-orange-50 shadow-lg">
                    Buy Now
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-slate-500 text-sm">{product.category}</p>
                  <p className="font-bold text-orange-600">₹{product.price}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}