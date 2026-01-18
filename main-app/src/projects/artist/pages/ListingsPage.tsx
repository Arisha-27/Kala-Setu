import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Search,
  Package,
  AlertCircle,
  CheckCircle2,
  Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

export default function ListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  // ... imports (keep existing)

  // 👇 Replace the deleteListing function with this robust version
  const deleteListing = async (id: string) => {
    setNotification(null);
    if (!window.confirm("Remove this listing?")) return;

    try {
      // 1. Try to Hard Delete
      const { error: deleteError } = await supabase.from('products').delete().eq('id', id);

      // 2. If Delete fails (likely due to existing orders), switch to Archive
      if (deleteError) {
        console.warn("Hard delete failed, switching to archive mode...", deleteError);

        const { error: archiveError } = await supabase
          .from('products')
          .update({ stock: 0 }) // Hide from store
          .eq('id', id);

        if (archiveError) {
          throw archiveError; // If even archiving fails, show real error
        }

        // UI: Show as Archived
        setListings(prev => prev.map(item => item.id === id ? { ...item, stock: 0 } : item));
        setNotification({
          type: 'warning',
          message: 'Item has existing orders. It was archived (hidden) instead of deleted.'
        });
        return;
      }

      // 3. If Hard Delete succeeded
      setListings(prev => prev.filter(item => item.id !== id));
      setNotification({ type: 'success', message: 'Listing deleted successfully.' });

    } catch (error: any) {
      console.error("Operation failed:", error);
      setNotification({ type: 'error', message: 'Could not delete or archive item.' });
    }
  };

  // ... rest of component

  const filteredListings = listings.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
          <p className="text-slate-500">Manage your product catalog.</p>
        </div>
        <Button
          onClick={() => navigate('/artist/ai-listing-generator')}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Listing
        </Button>
      </div>

      {/* 👇 Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2
          ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' : ''}
          ${notification.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : ''}
          ${notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' : ''}
        `}>
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
          {notification.type === 'warning' && <Archive className="w-5 h-5 text-amber-600" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}

          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-slate-200 focus-visible:ring-purple-500"
          />
        </div>
        <div className="text-sm text-slate-500 ml-auto hidden md:block">
          Showing <span className="font-semibold text-slate-900">{filteredListings.length}</span> products
        </div>
      </div>

      {/* Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No listings found</h3>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/artist/ai-listing-generator')}>Create First Listing</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((item) => (
            <Card key={item.id} className="group overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300 bg-white">
              <div className="relative aspect-square bg-slate-100 overflow-hidden">
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.name}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${item.stock === 0 ? 'grayscale opacity-60' : ''}`}
                />
                {/* Archived Badge */}
                {item.stock === 0 && (
                  <div className="absolute top-2 right-2 bg-slate-800/90 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm backdrop-blur-sm flex items-center gap-1">
                    <Archive className="w-3 h-3" /> Archived
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-slate-900 truncate flex-1 pr-2" title={item.name}>{item.name}</h3>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-700">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/artist/listings/edit/${item.id}`)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => deleteListing(item.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> {item.stock === 0 ? "Delete Permanently" : "Remove"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="font-mono font-medium text-slate-900">₹{item.price.toLocaleString()}</span>
                  <span className={`text-xs font-medium ${item.stock > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}