import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  CreditCard,
  Banknote,
  Receipt,
  Loader2
} from "lucide-react"

export default function EarningsDashboard() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])

  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    transactionFees: 0,
    lastMonthPercentage: 12
  })

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch Product Sales
      const { data: productSales } = await supabase
        .from('order_items')
        .select(`
          id, price_at_purchase, quantity, created_at,
          products!inner (name, artisan_id),
          orders!inner (profiles:customer_id(full_name))
        `)
        .eq('products.artisan_id', user.id)

      // 2. Fetch Workshop Bookings
      const { data: workshopSales } = await supabase
        .from('workshop_bookings')
        .select(`
          id, total_amount, created_at, full_name,
          workshops!inner (title, artisan_id)
        `)
        .eq('workshops.artisan_id', user.id)

      // --- DATA PROCESSING ---
      const normalizedProducts = (productSales || []).map((item: any) => ({
        id: item.id,
        type: 'Product',
        description: `Sale: ${item.products?.name} (x${item.quantity})`,
        customer: item.orders?.profiles?.full_name || "Guest Customer",
        amount: item.price_at_purchase * item.quantity,
        date: item.created_at,
        status: 'Completed'
      }))

      const normalizedWorkshops = (workshopSales || []).map((item: any) => ({
        id: item.id,
        type: 'Workshop',
        description: `Booking: ${item.workshops?.title}`,
        customer: item.full_name,
        amount: item.total_amount,
        date: item.created_at,
        status: 'Completed'
      }))

      const allTransactions = [...normalizedProducts, ...normalizedWorkshops]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setTransactions(allTransactions)

      // Calculate Totals
      const totalEarnings = allTransactions.reduce((sum, t) => sum + t.amount, 0)

      const now = new Date()
      const thisMonthEarnings = allTransactions
        .filter(t => {
          const d = new Date(t.date)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        .reduce((sum, t) => sum + t.amount, 0)

      setStats({
        totalEarnings,
        thisMonth: thisMonthEarnings,
        transactionFees: totalEarnings * 0.03,
        lastMonthPercentage: 12
      })

    } catch (error) {
      console.error("Error fetching financials:", error)
    } finally {
      setLoading(false)
    }
  }

  // 👇 NEW: Handle CSV Download
  const handleDownloadReport = () => {
    if (transactions.length === 0) {
      alert("No data available to download.")
      return
    }

    // 1. Define CSV Header
    const headers = ["ID", "Type", "Date", "Description", "Customer Name", "Amount (INR)", "Status"]

    // 2. Map Transactions to CSV Row format
    const rows = transactions.map(t => [
      t.id,
      t.type,
      new Date(t.date).toLocaleDateString(),
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes for CSV safety
      `"${t.customer}"`,
      t.amount,
      t.status
    ])

    // 3. Combine Header and Rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    // 4. Create Blob and Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `earnings_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getMonthlyAnalytics = () => {
    const months: Record<string, { earnings: number, count: number }> = {}
    transactions.forEach(t => {
      const date = new Date(t.date)
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' })
      if (!months[key]) months[key] = { earnings: 0, count: 0 }
      months[key].earnings += t.amount
      months[key].count += 1
    })
    return Object.entries(months).map(([month, data]) => ({
      month,
      earnings: data.earnings,
      orders: data.count
    })).reverse().slice(0, 6)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Completed</Badge>
      case "Processing": return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Processing</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Earnings Dashboard</h1>
            <p className="text-muted-foreground">Track your income</p>
          </div>
        </div>
        {/* 👇 UPDATED: Added onClick handler */}
        <Button
          onClick={handleDownloadReport}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Overview Cards (3 Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  ₹{stats.totalEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
                <div className="text-xs text-green-600 font-medium flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" /> +{stats.lastMonthPercentage}% vs last month
                </div>
              </div>
              <div className="p-2 bg-green-50 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  ₹{stats.thisMonth.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">This Month</div>
                <div className="text-xs text-muted-foreground mt-1">Current Period</div>
              </div>
              <div className="p-2 bg-blue-50 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  ₹{stats.transactionFees.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Platform Fees</div>
                <div className="text-xs text-muted-foreground mt-1">3% commission rate</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-full">
                <Receipt className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs (2 Column Grid) */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Monthly Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                <CreditCard className="w-5 h-5 text-primary" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No transactions found.</div>
                ) : (
                  transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border/60 rounded-lg hover:bg-muted/20 transition-colors gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.type === 'Product' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                          {t.type === 'Product' ? <DollarSign className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{t.description}</div>
                          <div className="text-sm text-muted-foreground">Customer: {t.customer}</div>
                          <div className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="flex justify-between md:block w-full md:w-auto text-right">
                        <div>
                          <div className="font-bold text-lg text-foreground">₹{t.amount.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Net: ₹{(t.amount * 0.97).toFixed(0)}</div>
                        </div>
                        {getStatusBadge(t.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Monthly Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {getMonthlyAnalytics().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Not enough data for analytics.</div>
                ) : (
                  getMonthlyAnalytics().map((data) => (
                    <div
                      key={data.month}
                      className="flex items-center justify-between p-4 border border-border/60 rounded-lg hover:bg-muted/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{data.month}</div>
                          <div className="text-sm text-muted-foreground">{data.orders} transactions</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-lg text-foreground">₹{data.earnings.toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}