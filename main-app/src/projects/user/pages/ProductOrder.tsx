import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Minus, Plus, ShoppingBag, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner"; // Assuming you have sonner or use alert

export default function ProductOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setOrdering(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please sign in to place an order");
        return;
      }

      // 1. Create Order
      const totalAmount = product.price * quantity;
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          status: 'processing',
          total_amount: totalAmount
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderData.id,
          product_id: product.id,
          quantity: quantity,
          price_at_purchase: product.price
        });

      if (itemError) throw itemError;

      setOrderComplete(true);
      
    } catch (error) {
      console.error("Order failed:", error);
      alert("Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-600" /></div>;
  if (!product) return <div className="p-10 text-center">Product not found</div>;

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-100 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
          <p className="text-slate-600 mb-8">
            Your order for <span className="font-semibold">{product.name}</span> has been placed successfully.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/customer/orders")}>
              View Orders
            </Button>
            <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => navigate("/customer")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="w-full md:w-1/2 h-[400px] md:h-auto bg-slate-100 relative">
             <img 
               src={product.image_url || "/placeholder.svg"} 
               alt={product.name} 
               className="w-full h-full object-cover"
             />
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-auto">
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 mb-4">
                {product.category || "Artisan Craft"}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
              <p className="text-2xl font-semibold text-slate-900 mb-6">₹{product.price}</p>
              
              <div className="prose prose-slate text-slate-600 mb-8">
                <p>{product.description || "Handcrafted with love and tradition. This unique piece showcases the rich heritage of Indian craftsmanship."}</p>
              </div>
            </div>

            {/* Order Controls */}
            <div className="border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between mb-6">
                <span className="font-medium text-slate-900">Quantity</span>
                <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-1 border border-slate-200">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-white rounded-md transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="font-semibold w-8 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-white rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8 p-4 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Total</span>
                <span className="text-2xl font-bold text-slate-900">₹{(product.price * quantity).toLocaleString()}</span>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-bold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200"
                onClick={handlePlaceOrder}
                disabled={ordering}
              >
                {ordering ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><ShoppingBag className="w-5 h-5 mr-2" /> Place Order</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}