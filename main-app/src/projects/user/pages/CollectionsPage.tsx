import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, Grid, List, Search, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  stock: number;
  likes: number;
  views: number;
  category: string;
  price: number;
  artisan_name: string;
  tags: string[];
}

const CollectionsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // These IDs must match the 'category' logic below
  const categories = [
    { id: "all", name: "All Products" },
    { id: "pottery", name: "Pottery & Ceramics" },
    { id: "textiles", name: "Textiles & Fabrics" },
    { id: "jewelry", name: "Jewelry & Accessories" },
    { id: "art", name: "Paintings & Art" },
    { id: "decor", name: "Home Decor" },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData: Product[] = data.map((item) => {
          // 1. Normalize Category for Filtering
          // We convert DB category to lowercase to match our Tab IDs
          const dbCat = (item.category || "").toLowerCase();
          let finalCat = "art"; // default

          if (dbCat.includes("pottery") || dbCat.includes("ceramic")) finalCat = "pottery";
          else if (dbCat.includes("textile") || dbCat.includes("saree") || dbCat.includes("fabric")) finalCat = "textiles";
          else if (dbCat.includes("jewelry") || dbCat.includes("silver")) finalCat = "jewelry";
          else if (dbCat.includes("decor") || dbCat.includes("home") || dbCat.includes("wood")) finalCat = "decor";
          else if (dbCat.includes("art") || dbCat.includes("painting")) finalCat = "art";

          return {
            id: item.id,
            title: item.name,
            description: item.description || "Authentic handmade craft from India.",
            image: item.image_url || "/placeholder.svg",
            stock: item.stock || 0,
            artisan_name: "Master Artisan",
            price: item.price,
            tags: item.tags || [], // Ensure tags are passed
            likes: item.likes || Math.floor(Math.random() * 500) + 50,
            views: item.views || Math.floor(Math.random() * 2000) + 500,
            category: finalCat 
          };
        });
        setProducts(formattedData);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query)));
      
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-orange-50 to-purple-50 py-16 border-b border-orange-100/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Discover Unique Crafts
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Explore and buy authentic handmade treasures directly from artisans
            </p>
            
            <div className="flex flex-col lg:flex-row gap-4 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-orange-600 hover:bg-orange-700" : ""}>
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-orange-600 hover:bg-orange-700" : ""}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8 h-auto gap-2 bg-transparent p-0">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="data-[state=active]:bg-orange-600 data-[state=active]:text-white border border-slate-200 bg-white py-2.5 shadow-sm transition-all"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-12">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedCategory === "all" ? "All Products" : categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <span className="text-slate-500 font-medium">
                    {filteredProducts.length} items found
                  </span>
                </div>
                
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
                  {filteredProducts.map((product) => (
                    viewMode === "grid" ? (
                      // GRID VIEW
                      <Card 
                        key={product.id} 
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full border-slate-200"
                        onClick={() => navigate(`/customer/product/${product.id}`)}
                      >
                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          {product.stock < 5 && product.stock > 0 && (
                             <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 shadow-md">
                               Only {product.stock} left
                             </Badge>
                          )}
                        </div>
                        
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                             <h3 className="text-lg font-bold text-slate-900 line-clamp-1 flex-1 pr-2">{product.title}</h3>
                             <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50 capitalize">
                                {product.category}
                             </Badge>
                          </div>
                          <p className="text-slate-500 text-sm font-medium">by {product.artisan_name}</p>
                        </CardHeader>
                        
                        <CardContent className="pb-4 flex-grow">
                           {/* 👇 DESCRIPTION ADDED HERE */}
                           <p className="text-sm text-slate-600 line-clamp-2 mb-3 h-10">
                             {product.description}
                           </p>

                           {/* 👇 TAGS ADDED HERE */}
                           <div className="flex flex-wrap gap-1.5 mb-3">
                             {product.tags.slice(0, 3).map(tag => (
                               <Badge key={tag} variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-500 hover:bg-slate-200">
                                 {tag}
                               </Badge>
                             ))}
                           </div>

                           <div className="text-2xl font-bold text-slate-900">₹{product.price}</div>
                        </CardContent>
                        
                        <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto bg-slate-50/50">
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4 text-slate-400" /> {product.likes}
                            </span>
                          </div>
                          <Button size="sm" className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                             <ShoppingBag className="w-4 h-4" /> Buy Now
                          </Button>
                        </CardFooter>
                      </Card>
                    ) : (
                      // LIST VIEW
                      <Card 
                        key={product.id} 
                        className="overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group border-slate-200"
                        onClick={() => navigate(`/customer/product/${product.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-48 md:h-40 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <h3 className="text-xl font-bold text-slate-900">{product.title}</h3>
                                  <div className="text-2xl font-bold text-slate-900">₹{product.price}</div>
                                </div>
                                <p className="text-sm text-slate-500 mb-2">by {product.artisan_name}</p>
                                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{product.description}</p>
                                
                                <div className="flex flex-wrap gap-2">
                                  {product.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs border-slate-200">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-end mt-4">
                                 <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
                                   <ShoppingBag className="w-4 h-4" /> Buy Now
                                 </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  ))}
                </div>
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Search className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
                    <p className="text-slate-500 mt-1">Try selecting a different category or adjusting your search.</p>
                  </div>
                )}
              </section>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;