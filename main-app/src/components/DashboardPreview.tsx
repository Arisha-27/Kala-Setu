import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Users, ShoppingBag, TrendingUp, Search, Heart, ShoppingCart, Bell } from "lucide-react";

interface DashboardPreviewProps {
  mode: "user" | "artist";
}

const DashboardPreview: React.FC<DashboardPreviewProps> = ({ mode }) => {
  if (mode === "artist") {
    return (
      <Card className="p-8 bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300">
        <div className="space-y-6">
          <div className="bg-gradient-accent rounded-2xl p-6 text-accent-foreground">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="h-6 w-6" />
              <h3 className="text-xl font-bold">Welcome back, Master Artisan!</h3>
            </div>
            <p className="text-accent-foreground/80">Ready to showcase your craftsmanship to the world? Here's your dashboard overview.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-warm rounded-xl p-4 border border-brand-neutral">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Products</span>
                <Badge variant="outline" className="text-xs">+12%</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">24</p>
            </div>
            <div className="bg-brand-warm rounded-xl p-4 border border-brand-neutral">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Active Orders</span>
                <Badge variant="outline" className="text-xs">+3</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">8</p>
            </div>
            <div className="bg-brand-warm rounded-xl p-4 border border-brand-neutral">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                <Badge variant="outline" className="text-xs">+18%</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">₹15,240</p>
            </div>
            <div className="bg-brand-warm rounded-xl p-4 border border-brand-neutral">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Profile Views</span>
                <Badge variant="outline" className="text-xs">+25%</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">1,247</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-background rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Quick Actions</span>
              </div>
              <div className="text-xs text-muted-foreground">Create New Listing</div>
            </div>
            <div className="flex-1 bg-background rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Recent Orders</span>
              </div>
              <div className="text-xs text-muted-foreground">Processing: 3</div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300">
      <div className="space-y-6">
        <div className="bg-gradient-hero rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6" />
              <h3 className="text-xl font-bold">Handloom Heritage</h3>
            </div>
            <p className="text-primary-foreground/90 mb-4">Silk, cotton, and traditional weaves</p>
            <p className="text-sm text-primary-foreground/80">Supporting textile artisans across rural India</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <div className="w-24 h-24 bg-primary-foreground/20 rounded-full"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-background rounded-xl p-3 border border-border text-center">
            <Search className="h-5 w-5 mx-auto mb-2 text-primary" />
            <span className="text-xs text-muted-foreground">Discover</span>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
            <span className="text-xs text-muted-foreground">Artisans</span>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border text-center">
            <ShoppingCart className="h-5 w-5 mx-auto mb-2 text-primary" />
            <span className="text-xs text-muted-foreground">Collections</span>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border text-center">
            <Heart className="h-5 w-5 mx-auto mb-2 text-primary" />
            <span className="text-xs text-muted-foreground">Wishlist</span>
          </div>
        </div>

        <div className="bg-brand-warm rounded-xl p-4 border border-brand-neutral">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Featured Categories</span>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-xs p-2 bg-background rounded-lg border border-border">Handwoven Textiles</div>
            <div className="text-xs p-2 bg-background rounded-lg border border-border">Pottery & Ceramics</div>
            <div className="text-xs p-2 bg-background rounded-lg border border-border">Wood Crafts</div>
            <div className="text-xs p-2 bg-background rounded-lg border border-border">Metal Work</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DashboardPreview;