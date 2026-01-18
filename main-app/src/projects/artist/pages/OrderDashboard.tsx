import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Package, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Loader2,
  Printer,
  Eye,
  MessageSquare,
  Truck
} from "lucide-react";

export default function OrderDashboard() {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Product Sales (Order Items linked to your products)
      const { data: salesData } = await supabase
        .from('order_items')
        .select(`
          *,
          products!inner (name, artisan_id),
          orders!inner (
            id, 
            created_at, 
            status, 
            total_amount,
            profiles:customer_id (full_name, email, location) 
          )
        `)
        .eq('products.artisan_id', user.id)
        .order('created_at', { ascending: false });

      setSales(salesData || []);

      // 2. Fetch Workshop Bookings (Workshops created by you)
      const { data: bookingData } = await supabase
        .from('workshop_bookings')
        .select(`
          *,
          workshops!inner (title, artisan_id),
          profiles:user_id (full_name, email)
        `)
        .eq('workshops.artisan_id', user.id)
        .order('created_at', { ascending: false });

      setBookings(bookingData || []);

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = {
    totalOrders: sales.length,
    processing: sales.filter(s => s.orders?.status === 'Processing' || s.orders?.status === 'New').length,
    delivered: sales.filter(s => s.orders?.status === 'Delivered').length,
    workshopBookings: bookings.length
  };

  // Helper for Status Badge
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || 'new';
    if (s === 'delivered' || s === 'confirmed') return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Delivered</Badge>;
    if (s === 'shipped') return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Shipped</Badge>;
    if (s === 'processing') return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Processing</Badge>;
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">New</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase() || 'new';
    if (s === 'delivered') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (s === 'shipped') return <Truck className="w-5 h-5 text-purple-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-purple-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order Dashboard</h1>
          <p className="text-slate-500">Manage your product orders and workshop bookings</p>
        </div>
      </div>

      {/* 3 Stats Cards + Workshop Count */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-slate-900 mb-1">{stats.totalOrders}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-1">{stats.processing}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processing</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-1">{stats.delivered}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivered</div>
          </CardContent>
        </Card>
        <Card className="border-purple-100 bg-purple-50/50 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-purple-700 mb-1">{stats.workshopBookings}</div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Workshop Bookings</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="border-slate-200 shadow-sm mt-8">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-slate-100">
              <TabsTrigger value="products">Product Orders</TabsTrigger>
              <TabsTrigger value="workshops">Workshop Bookings</TabsTrigger>
            </TabsList>
            
            {/* PRODUCT ORDERS LIST */}
            <TabsContent value="products" className="space-y-4">
              {sales.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No orders received yet.</div>
              ) : (
                sales.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors gap-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-slate-50 rounded-full">
                        {getStatusIcon(item.orders?.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-slate-900">Order #{item.orders?.id.slice(0,6)}</span>
                          {getStatusBadge(item.orders?.status)}
                        </div>
                        <div className="text-sm font-medium text-slate-700">
                          {item.products?.name} <span className="text-slate-400">x{item.quantity}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Customer: {item.orders?.profiles?.full_name || "Guest"} • {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                      <div className="text-right">
                        <div className="font-bold text-lg text-slate-900">₹{item.price_at_purchase * item.quantity}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-purple-600"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-purple-600"><Printer className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* WORKSHOP BOOKINGS LIST */}
            <TabsContent value="workshops" className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No workshop bookings yet.</div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-purple-100 bg-purple-50/20 rounded-xl hover:bg-purple-50/40 transition-colors gap-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-white rounded-full text-purple-600 shadow-sm">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-slate-900">{booking.workshops?.title}</span>
                          {getStatusBadge(booking.booking_status)}
                        </div>
                        <div className="text-sm text-slate-600">
                          Booked by: <span className="font-medium text-slate-900">{booking.full_name}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {booking.number_of_seats} Seats • {new Date(booking.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                      <div className="text-right">
                        <div className="font-bold text-lg text-purple-700">₹{booking.total_amount}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-purple-400 hover:text-purple-700">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}