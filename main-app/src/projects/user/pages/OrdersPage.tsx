import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, Package, Calendar, ChevronRight, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth"); // Redirect if not logged in
        return;
      }

      // Fetch Orders with Items and Product details
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          order_items (
            id,
            quantity,
            price_at_purchase,
            products (
              name,
              image_url
            )
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);

    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
          <p className="text-slate-500 mt-2">Track and manage your recent purchases.</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="text-center py-16 border-dashed">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No orders yet</h3>
            <p className="text-slate-500 mb-6">Start exploring our collection of handcrafted items.</p>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => navigate("/customer")}>
              Browse Products
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow border-slate-200">

                {/* Order Header */}
                <div className="bg-slate-50/50 p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">Order #{order.id.slice(0, 8)}</span>
                      <Badge variant="outline" className={`${getStatusColor(order.status)} capitalize`}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-slate-500 gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-slate-500">Total Amount</span>
                    <p className="text-xl font-bold text-slate-900">₹{order.total_amount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-6 space-y-4">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                        <img
                          src={item.products?.image_url || "/placeholder.svg"}
                          alt={item.products?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 truncate">{item.products?.name}</h4>
                        <p className="text-sm text-slate-500">Qty: {item.quantity} × ₹{item.price_at_purchase}</p>
                      </div>
                      <div className="text-right font-medium text-slate-700">
                        ₹{(item.quantity * item.price_at_purchase).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}

              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}