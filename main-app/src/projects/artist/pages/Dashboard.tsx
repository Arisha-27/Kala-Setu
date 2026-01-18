import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  Box,
  TrendingUp,
  ListOrdered,
  Loader2
} from "lucide-react"

export default function DashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("Artisan")

  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOrders: 0,
    monthlyRevenue: 0
  })

  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (profile) setUserName(profile.full_name)

      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('artisan_id', user.id)

      const { data: activeItems } = await supabase
        .from('order_items')
        .select('orders!inner(status), products!inner(artisan_id)')
        .eq('products.artisan_id', user.id)
        .in('orders.status', ['New', 'Processing', 'new', 'processing'])

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: revenueItems } = await supabase
        .from('order_items')
        .select('price_at_purchase, quantity, created_at, products!inner(artisan_id)')
        .eq('products.artisan_id', user.id)
        .gte('created_at', startOfMonth)

      const revenue = (revenueItems || []).reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0)

      const { data: recent } = await supabase
        .from('order_items')
        .select(`
          quantity,
          price_at_purchase,
          created_at,
          products!inner (name, artisan_id),
          orders!inner (id, status, profiles(full_name))
        `)
        .eq('products.artisan_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      setStats({
        totalProducts: productCount || 0,
        activeOrders: activeItems?.length || 0,
        monthlyRevenue: revenue
      })

      const formattedRecent = (recent || []).map((item: any) => ({
        id: item.orders?.id,
        customer: item.orders?.profiles?.full_name || "Guest",
        product: item.products?.name,
        amount: item.price_at_purchase * item.quantity,
        status: item.orders?.status || "New"
      }))

      setRecentOrders(formattedRecent)

    } catch (error) {
      console.error("Error fetching dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-purple-600" /></div>

  return (
    <div className="space-y-8 animate-fade-in p-6">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
        <p className="opacity-90">Ready to showcase your craftsmanship to the world? Here is your dashboard overview.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-purple-100 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-medium">Total Products</span>
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalProducts}</div>
            <div className="text-sm text-green-600 mt-1 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> Active Listings
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-medium">Active Orders</span>
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.activeOrders}</div>
            <div className="text-sm text-blue-600 mt-1 font-medium">Needs Attention</div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-medium">Monthly Revenue</span>
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">₹{stats.monthlyRevenue.toLocaleString()}</div>
            <div className="text-sm text-slate-500 mt-1">This month so far</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Box className="w-5 h-5 text-purple-600" /> Quick Actions
          </h2>
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 justify-start space-x-4 border-slate-200 hover:bg-purple-50 hover:border-purple-200 group"
              onClick={() => navigate('/artist/ai-listing-generator')}
            >
              <div className="p-2 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <Plus className="w-5 h-5 text-purple-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Create New Listing</div>
                <div className="text-xs text-slate-500">Add a new product to shop</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start space-x-4 border-slate-200 hover:bg-purple-50 hover:border-purple-200 group"
              onClick={() => navigate('/artist/inventory-management')}
            >
              <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Package className="w-5 h-5 text-blue-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Check Inventory</div>
                <div className="text-xs text-slate-500">Manage stock levels</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start space-x-4 border-slate-200 hover:bg-purple-50 hover:border-purple-200 group"
              onClick={() => navigate('/artist/sales-analytics')}
            >
              <div className="p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <TrendingUp className="w-5 h-5 text-green-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">View Analytics</div>
                <div className="text-xs text-slate-500">Track your performance</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start space-x-4 border-slate-200 hover:bg-purple-50 hover:border-purple-200 group"
              onClick={() => navigate('/artist/order-dashboard')}
            >
              <div className="p-2 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                <ListOrdered className="w-5 h-5 text-orange-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Process Orders</div>
                <div className="text-xs text-slate-500">Handle customer orders</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" /> Recent Orders
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/artist/order-dashboard')}>
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-xl text-slate-400 bg-slate-50">
                No orders received yet.
              </div>
            ) : (
              recentOrders.map((order, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{order.customer}</div>
                      <div className="text-sm text-slate-500">{order.product}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">₹{order.amount}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}