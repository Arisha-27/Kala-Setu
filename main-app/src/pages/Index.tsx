import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Search, ShoppingCart, Heart } from "lucide-react";
import heroImage from "../assets/hero-artisan-marketplace.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<"user" | "artist">("user");

  const handleGetStarted = () => {
    // 👇 UPDATED: Navigate to Auth page first for both modes
    navigate("/auth");
  };

  return (
    <div className="min-h-screen font-sans text-foreground relative selection:bg-orange-100">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600">
                KalaSetu
              </h1>
            </div>
            <Link to="/auth">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">

        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/70 to-white" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="mx-auto max-w-4xl text-center">

            <div className="mb-6 inline-flex items-center rounded-full border border-orange-200 bg-orange-50/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-orange-700 shadow-sm animate-fade-in">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              <span>India's Premier Artisan Marketplace</span>
            </div>

            <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl drop-shadow-sm text-slate-900">
              Connecting Artisans with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">
                Art Lovers
              </span>
            </h1>

            <p className="mb-10 text-xl text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto">
              Discover authentic handcrafted treasures directly from skilled artisans across India,
              or showcase your artistic masterpieces worldwide.
            </p>

            {/* Mode Toggle Buttons */}
            <div className="mx-auto mb-12 flex max-w-md items-center justify-center rounded-full border border-slate-200 bg-white/80 backdrop-blur-md p-1.5 shadow-xl">
              <button
                onClick={() => setSelectedMode("user")}
                className={`flex-1 rounded-full py-3 text-sm font-bold transition-all duration-300 ${selectedMode === "user"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md scale-105"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                I'm a Customer
              </button>
              <button
                onClick={() => setSelectedMode("artist")}
                className={`flex-1 rounded-full py-3 text-sm font-bold transition-all duration-300 ${selectedMode === "artist"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md scale-105"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                I'm an Artisan
              </button>
            </div>

            {/* Main Action Button */}
            <Button
              size="lg"
              onClick={handleGetStarted}
              className={`h-14 px-10 text-lg font-bold shadow-xl transition-all hover:scale-105 ${selectedMode === 'artist'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
            >
              {selectedMode === "user" ? "Explore Marketplace" : "Start Selling"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-24 bg-slate-50/80 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold md:text-4xl text-slate-900">
              {selectedMode === "user" ? "Discover Amazing Crafts" : "Grow Your Craft Business"}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
              {selectedMode === "user"
                ? "Explore a curated marketplace of authentic handcrafted items from talented artisans across India."
                : "Professional tools to manage your inventory, orders, and connect with customers worldwide."
              }
            </p>
          </div>

          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            {selectedMode === 'user' ? (
              <div className="flex flex-col">
                <div className="h-64 bg-gradient-to-r from-orange-400 to-red-500 p-10 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                      Featured Collection
                    </span>
                    <h3 className="text-4xl font-bold text-white mb-2">Handloom Heritage</h3>
                    <p className="text-white/90 text-lg">Silk, cotton, and traditional weaves from Banaras.</p>
                  </div>
                </div>
                <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: Search, label: "Search", color: "text-orange-500" },
                    { icon: Sparkles, label: "New Arrivals", color: "text-purple-500" },
                    { icon: ShoppingCart, label: "Cart", color: "text-blue-500" },
                    { icon: Heart, label: "Wishlist", color: "text-red-500" }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                      <item.icon className={`w-8 h-8 ${item.color} mb-3 group-hover:scale-110 transition-transform`} />
                      <span className="font-semibold text-slate-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="h-64 bg-gradient-to-r from-purple-600 to-indigo-700 p-10 flex flex-col justify-center relative">
                  <h3 className="text-3xl font-bold text-white mb-2">Welcome back, Master Artisan!</h3>
                  <p className="text-white/80 text-lg">You have 5 new orders to ship today.</p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm text-slate-500 mb-1">Total Sales</p>
                      <p className="text-2xl font-bold text-slate-900">₹1,24,000</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm text-slate-500 mb-1">Active Listings</p>
                      <p className="text-2xl font-bold text-slate-900">24 Items</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm text-slate-500 mb-1">Profile Views</p>
                      <p className="text-2xl font-bold text-slate-900">856</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600">
              KalaSetu
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Bridging traditional craftsmanship with modern commerce
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;