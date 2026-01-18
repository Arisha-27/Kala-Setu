import { useState } from "react";
import { Heart, Package, Star, TrendingUp, Clock, Users, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import potteryImage from "@/assets/artisan-pottery.jpg";
import textileImage from "@/assets/artisan-textiles.jpg";
import jewelryImage from "@/assets/artisan-jewelry.jpg";
import woodworkImage from "@/assets/artisan-woodwork.jpg";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock user data
  const user = {
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    avatar: "/placeholder-avatar.jpg",
    memberSince: "March 2023",
    totalOrders: 12,
    totalSpent: 45650,
    favoriteArtisans: 8,
    wishlistItems: 15
  };

  // Mock data for recent orders
  const recentOrders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      items: "Blue Pottery Vase + Ceramic Bowl",
      artisan: "Ramesh Kumar",
      total: 3200,
      status: "Delivered",
      image: potteryImage
    },
    {
      id: "ORD-002", 
      date: "2024-01-10",
      items: "Banarasi Silk Saree",
      artisan: "Meera Devi",
      total: 12500,
      status: "In Transit",
      image: textileImage
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      items: "Silver Necklace Set",
      artisan: "Arjun Singh", 
      total: 8750,
      status: "Delivered",
      image: jewelryImage
    }
  ];

  // Mock data for followed artisans
  const followedArtisans = [
    {
      id: "1",
      name: "Ramesh Kumar",
      craft: "Blue Pottery",
      location: "Jaipur",
      avatar: potteryImage,
      newProducts: 3,
      lastUpdate: "2 days ago"
    },
    {
      id: "2",
      name: "Meera Devi", 
      craft: "Handloom",
      location: "Varanasi",
      avatar: textileImage,
      newProducts: 1,
      lastUpdate: "1 week ago"
    },
    {
      id: "3",
      name: "Arjun Singh",
      craft: "Jewelry",
      location: "Udaipur", 
      avatar: jewelryImage,
      newProducts: 2,
      lastUpdate: "3 days ago"
    }
  ];

  // Mock data for wishlist
  const wishlistProducts = [
    {
      id: "1",
      name: "Hand-painted Ceramic Dinner Set",
      price: 4500,
      originalPrice: 5200,
      image: potteryImage,
      artisan: "Ramesh Kumar",
      craft: "Blue Pottery",
      rating: 4.9,
      reviews: 67,
      inStock: true,
      featured: false
    },
    {
      id: "2",
      name: "Traditional Wooden Jewelry Box",
      price: 2800,
      image: woodworkImage,
      artisan: "Suresh Pal",
      craft: "Wood Carving", 
      rating: 4.7,
      reviews: 23,
      inStock: true,
      featured: false
    }
  ];

  const stats = [
    { label: "Total Orders", value: user.totalOrders, icon: Package, color: "text-primary" },
    { label: "Total Spent", value: `₹${user.totalSpent.toLocaleString()}`, icon: TrendingUp, color: "text-green-600" },
    { label: "Favorite Artisans", value: user.favoriteArtisans, icon: Heart, color: "text-red-500" },
    { label: "Wishlist Items", value: user.wishlistItems, icon: Star, color: "text-yellow-500" }
  ];

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl gradient-sunset text-white">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Welcome back, <span className="text-gradient-sunset">{user.name}</span>
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    Member since {user.memberSince} • {user.email}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                      <div key={stat.label} className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start space-x-2 mb-1">
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          <span className="text-lg font-bold text-foreground">{stat.value}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button variant="outline">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span>Recent Orders</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center space-x-4 p-3 rounded-lg border border-border/50">
                      <img 
                        src={order.image} 
                        alt={order.items}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{order.items}</p>
                        <p className="text-xs text-muted-foreground">by {order.artisan}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₹{order.total.toLocaleString()}</p>
                        <Badge 
                          variant={order.status === "Delivered" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">View All Orders</Button>
                </CardContent>
              </Card>

              {/* Artisan Updates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Artisan Updates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {followedArtisans.map((artisan) => (
                    <div key={artisan.id} className="flex items-center space-x-4 p-3 rounded-lg border border-border/50">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={artisan.avatar} alt={artisan.name} />
                        <AvatarFallback>{artisan.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">{artisan.name}</p>
                        <p className="text-xs text-muted-foreground">{artisan.craft} • {artisan.location}</p>
                        <p className="text-xs text-primary">
                          {artisan.newProducts} new product{artisan.newProducts !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{artisan.lastUpdate}</p>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">View All Following</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 p-4 rounded-lg border border-border/50">
                      <img 
                        src={order.image} 
                        alt={order.items}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="font-medium text-foreground">{order.items}</p>
                            <p className="text-sm text-muted-foreground">by {order.artisan}</p>
                            <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                          </div>
                          <div className="mt-2 md:mt-0 text-right">
                            <p className="font-bold text-lg">₹{order.total.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{order.date}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge 
                          variant={order.status === "Delivered" ? "default" : "secondary"}
                        >
                          {order.status}
                        </Badge>
                        <Button variant="outline" size="sm">Track Order</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Following Artisans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followedArtisans.map((artisan) => (
                    <div key={artisan.id} className="p-4 rounded-lg border border-border/50 hover-lift">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={artisan.avatar} alt={artisan.name} />
                          <AvatarFallback>{artisan.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{artisan.name}</p>
                          <p className="text-sm text-muted-foreground">{artisan.craft}</p>
                          <p className="text-xs text-muted-foreground">{artisan.location}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-primary">
                          {artisan.newProducts} new products
                        </p>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Wishlist ({wishlistProducts.length} items)</span>
                  <Button variant="outline" size="sm">Clear All</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlistProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;