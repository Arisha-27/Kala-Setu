import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Loader2,
  Package,
  Trophy
} from "lucide-react"

export default function SalesAnalytics() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0
  })

  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [topCustomers, setTopCustomers] = useState<any[]>([])

  useEffect(() => {
    fetchRealSalesData()
  }, [])

  const fetchRealSalesData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. FETCH REAL SALES DATA
      const { data: items, error } = await supabase
        .from('order_items')
        .select(`
          quantity,
          price_at_purchase,
          created_at,
          products!inner (id, name, artisan_id),
          orders!inner (id, created_at, profiles (full_name, email, location))
        `)
        .eq('products.artisan_id', user.id)

      if (error) throw error

      if (items) {
        // --- A. CALCULATE TOTALS ---
        // 👇 FIXED: Added (item: any) to fix the red squiggly line
        const totalRev = items.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0)
        const uniqueOrders = new Set(items.map((item: any) => item.orders?.id)).size

        setMetrics({
          totalRevenue: totalRev,
          totalOrders: uniqueOrders,
          avgOrderValue: uniqueOrders > 0 ? Math.round(totalRev / uniqueOrders) : 0
        })

        // --- B. MONTHLY REVENUE TREND ---
        const months: { [key: string]: { revenue: number, sales: number } } = {}
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // 👇 FIXED: Added (item: any)
        items.forEach((item: any) => {
          const date = new Date(item.created_at)
          const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`

          if (!months[monthKey]) months[monthKey] = { revenue: 0, sales: 0 }
          months[monthKey].revenue += (item.price_at_purchase * item.quantity)
          months[monthKey].sales += item.quantity
        })

        const sortedMonths = Object.entries(months).map(([month, data]) => ({
          month,
          revenue: data.revenue,
          sales: data.sales
        })).reverse().slice(0, 6).reverse()

        setMonthlyData(sortedMonths)

        // --- C. TOP PRODUCTS ---
        const productStats: { [key: string]: { sales: number, revenue: number } } = {}

        // 👇 FIXED: Added (item: any)
        items.forEach((item: any) => {
          const name = item.products?.name || "Unknown Product"
          if (!productStats[name]) productStats[name] = { sales: 0, revenue: 0 }
          productStats[name].sales += item.quantity
          productStats[name].revenue += (item.price_at_purchase * item.quantity)
        })

        const sortedProducts = Object.entries(productStats)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        setTopProducts(sortedProducts)

        // --- D. TOP CUSTOMERS ---
        const customerStats: { [key: string]: { name: string, email: string, spent: number, orders: Set<string> } } = {}

        // 👇 FIXED: Added (item: any)
        items.forEach((item: any) => {
          const email = item.orders?.profiles?.email || "Guest"
          const name = item.orders?.profiles?.full_name || "Unknown Customer"

          if (!customerStats[email]) {
            customerStats[email] = { name, email, spent: 0, orders: new Set() }
          }
          customerStats[email].spent += (item.price_at_purchase * item.quantity)
          customerStats[email].orders.add(item.orders?.id)
        })

        const sortedCustomers = Object.values(customerStats)
          .map(c => ({
            name: c.name,
            email: c.email,
            spent: c.spent,
            orderCount: c.orders.size
          }))
          .sort((a, b) => b.spent - a.spent)
          .slice(0, 5)

        setTopCustomers(sortedCustomers)
      }

    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-purple-600" /></div>

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center border border-purple-200">
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Analytics</h1>
          <p className="text-slate-500">Real-time insights from your orders</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900">₹{metrics.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-slate-500">Total Revenue</div>
              </div>
              <div className="p-2 bg-green-50 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900">{metrics.totalOrders}</div>
                <div className="text-sm text-slate-500">Total Orders</div>
              </div>
              <div className="p-2 bg-blue-50 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900">₹{metrics.avgOrderValue.toLocaleString()}</div>
                <div className="text-sm text-slate-500">Avg. Order Value</div>
              </div>
              <div className="p-2 bg-purple-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
        </TabsList>

        {/* 1. REVENUE TAB */}
        <TabsContent value="revenue" className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Monthly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.length > 0 ? monthlyData.map((data) => (
                  <div key={data.month} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 font-bold text-xs uppercase">
                        {data.month.split(" ")[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{data.month}</div>
                        <div className="text-sm text-slate-500">{data.sales} items sold</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-slate-900">₹{data.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-slate-500">No sales data found yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. TOP PRODUCTS TAB */}
        <TabsContent value="products" className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Package className="w-5 h-5 text-purple-600" />
                Best Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length === 0 ? <div className="text-center py-6 text-slate-500">No products sold yet.</div> :
                  topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{product.name}</div>
                          <div className="text-sm text-slate-500">{product.sales} units sold</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-slate-900">₹{product.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. TOP CUSTOMERS TAB (Replaces Traffic) */}
        <TabsContent value="customers" className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Users className="w-5 h-5 text-purple-600" />
                Top Customers (By Spending)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.length === 0 ? <div className="text-center py-6 text-slate-500">No customer data yet.</div> :
                  topCustomers.map((customer, index) => (
                    <div key={customer.email} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{customer.name}</div>
                          <div className="text-sm text-slate-500">{customer.orderCount} Orders</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-slate-900">₹{customer.spent.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}