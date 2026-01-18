import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Package, 
  Plus, 
  Search,
  Edit,
  Eye,
  AlertTriangle,
  Loader2,
  Save
} from "lucide-react"

// Define the shape of our Product
interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image_url: string | null
}

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: ""
  })

  // 1. Fetch Data on Load
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  // 2. Handle "Add Product" Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const { error } = await supabase
        .from('products')
        .insert({
          artisan_id: user.id,
          name: newProduct.name,
          category: newProduct.category,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          image_url: null 
        })

      if (error) throw error

      // Success: Close modal, reset form, refresh list
      setIsDialogOpen(false)
      setNewProduct({ name: "", category: "", price: "", stock: "" })
      fetchProducts() 
      
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Failed to add product. Check console for details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper functions
  const getStatusBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>
    if (stock <= 5) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Low Stock</Badge>
    return <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">In Stock</Badge>
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stockSummary = {
    total: products.length,
    inStock: products.filter(p => p.stock > 5).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    outOfStock: products.filter(p => p.stock === 0).length
  }

  return (
    // Applied 'theme-artist' class here to force purple tokens if configured, 
    // but also manually applying purple classes below to be safe.
    <div className="space-y-6 animate-fade-in theme-artist">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* PURPLE ICON BACKGROUND */}
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center border border-purple-200">
            <Package className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-slate-500">Track and manage your product stock levels</p>
          </div>
        </div>

        {/* 👇 ADD PRODUCT DIALOG */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {/* PURPLE BUTTON */}
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all hover:scale-105">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white border-purple-100 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-purple-900">Add New Product</DialogTitle>
              <DialogDescription>
                Enter the details of your new craft item below.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddProduct} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-700">Product Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Handwoven Silk Scarf" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="focus-visible:ring-purple-500"
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-slate-700">Category</Label>
                <Input 
                  id="category" 
                  placeholder="e.g. Textiles, Pottery" 
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="focus-visible:ring-purple-500"
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-slate-700">Price (₹)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="focus-visible:ring-purple-500"
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock" className="text-slate-700">Stock Quantity</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="0" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="focus-visible:ring-purple-500"
                    required 
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                {/* PURPLE SAVE BUTTON */}
                <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Product</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Products" value={stockSummary.total} />
        <StatsCard title="In Stock" value={stockSummary.inStock} color="text-emerald-600" />
        <StatsCard title="Low Stock" value={stockSummary.lowStock} color="text-amber-600" />
        <StatsCard title="Out of Stock" value={stockSummary.outOfStock} color="text-red-600" />
      </div>

      {/* Main Content Area */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900">Product Inventory</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 border-border bg-background focus-visible:ring-purple-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No products found. Click "Add Product" to start building your collection!
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-purple-50/50 transition-colors bg-card group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl border border-slate-100 group-hover:border-purple-200 transition-colors">
                      📦
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{product.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{product.category || "Uncategorized"}</span>
                        <span>•</span>
                        <span>₹{product.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium text-slate-900 mb-1">Stock: {product.stock}</div>
                      {getStatusBadge(product.stock)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="hover:text-purple-700 hover:bg-purple-100">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:text-purple-700 hover:bg-purple-100">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {product.stock <= 5 && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({ title, value, color = "text-slate-900" }: { title: string, value: number, color?: string }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-6">
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
        <div className="text-sm text-slate-500 font-medium mt-1">{title}</div>
      </CardContent>
    </Card>
  )
}