import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Calendar, Clock, MapPin, Loader2, ArrowLeft, CheckCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Workshop {
  id: string;
  title: string;
  price: number;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  image_url: string;
}

const WorkshopBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [seats, setSeats] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  // Fetch Workshop & User Details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Get Workshop
        const { data: workshopData, error: workshopError } = await supabase
          .from('workshops')
          .select('*')
          .eq('id', id)
          .single();
          
        if (workshopError) throw workshopError;
        setWorkshop(workshopData);

        // 2. Auto-fill user data if logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
           const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
           setFormData(prev => ({
             ...prev,
             email: user.email || "",
             fullName: profile?.full_name || ""
           }));
        }

      } catch (error) {
        console.error("Error loading booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBooking = async () => {
    if (!workshop) return;
    
    try {
      setProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Please sign in to book a workshop");
        return;
      }

      // 1. Insert Booking Record
      const { error } = await supabase
        .from('workshop_bookings')
        .insert({
          workshop_id: workshop.id,
          user_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          number_of_seats: seats,
          total_amount: workshop.price * seats,
          payment_status: 'paid' 
        });

      if (error) throw error;

      // 2. Update Workshop Participant Count (Using the new SQL function)
      const { error: rpcError } = await supabase.rpc('increment_participants', { 
        row_id: workshop.id, 
        count: seats 
      });

      if (rpcError) {
        console.error("Failed to update count:", rpcError);
        // We don't stop the flow here because the booking itself succeeded
      }

      setSuccess(true);

    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Helper for Time
  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!workshop) return <div className="min-h-screen flex items-center justify-center">Workshop not found</div>;

  // SUCCESS STATE
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-green-200 bg-green-50/50 shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h2>
          <p className="text-green-700 mb-6 px-4">
            You are all set for <strong>{workshop.title}</strong>. 
            {/* 👇 FIXED: Email is now hidden for privacy */}
            <br/>We have sent the tickets to your registered email address.
          </p>
          <Button onClick={() => navigate('/customer/workshops')} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
            Browse More Workshops
          </Button>
        </Card>
      </div>
    );
  }

  // BOOKING FORM STATE
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Workshops
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Workshop Summary */}
          <div className="lg:col-span-1 space-y-6">
             <Card className="overflow-hidden border-border/60 shadow-md">
               <div className="aspect-video bg-muted relative">
                 <img src={workshop.image_url || "https://placehold.co/600x400"} alt={workshop.title} className="w-full h-full object-cover" />
               </div>
               <CardContent className="p-6 space-y-4">
                 <h2 className="font-bold text-xl leading-tight">{workshop.title}</h2>
                 
                 <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                       <Calendar className="w-4 h-4 text-primary" />
                       <span>{new Date(workshop.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                       <Clock className="w-4 h-4 text-primary" />
                       <span>{formatTime(workshop.start_time)} - {formatTime(workshop.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                       <MapPin className="w-4 h-4 text-primary" />
                       <span>{workshop.location}</span>
                    </div>
                 </div>

                 <Separator />
                 
                 <div className="flex justify-between items-center font-medium">
                   <span>Price per person</span>
                   <span className="text-lg">₹{workshop.price}</span>
                 </div>
               </CardContent>
             </Card>
          </div>

          {/* RIGHT: Booking Form */}
          <div className="lg:col-span-2">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <CreditCard className="w-5 h-5 text-primary" /> Complete your Booking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Contact Info */}
                <div className="space-y-4">
                   <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contact Information</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input 
                          value={formData.fullName} 
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                          placeholder="John Doe" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input 
                           value={formData.phone} 
                           onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                           placeholder="+91 98765 43210" 
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input 
                           value={formData.email} 
                           onChange={(e) => setFormData({...formData, email: e.target.value})} 
                           placeholder="john@example.com" 
                        />
                      </div>
                   </div>
                </div>

                <Separator />

                {/* Ticket Selection */}
                <div className="space-y-4">
                   <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Tickets</h3>
                   <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">General Admission</p>
                        <p className="text-sm text-muted-foreground">Includes all materials</p>
                      </div>
                      <div className="flex items-center gap-3 bg-background rounded-md border p-1">
                         <Button 
                           variant="ghost" size="sm" className="h-8 w-8 rounded-sm"
                           onClick={() => setSeats(Math.max(1, seats - 1))}
                         >-</Button>
                         <span className="font-bold w-4 text-center">{seats}</span>
                         <Button 
                           variant="ghost" size="sm" className="h-8 w-8 rounded-sm"
                           onClick={() => setSeats(Math.min(10, seats + 1))}
                         >+</Button>
                      </div>
                   </div>
                </div>

                {/* Total */}
                <div className="bg-primary/5 p-4 rounded-lg flex justify-between items-center border border-primary/10">
                   <span className="font-semibold text-primary-foreground/80">Total Amount</span>
                   <span className="text-2xl font-bold text-primary">₹{workshop.price * seats}</span>
                </div>

              </CardContent>
              <CardFooter>
                 <Button 
                   onClick={handleBooking} 
                   disabled={processing}
                   className="w-full h-12 text-lg font-semibold shadow-md bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                 >
                   {processing ? <Loader2 className="animate-spin mr-2" /> : "Pay & Confirm Booking"}
                 </Button>
              </CardFooter>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WorkshopBooking;