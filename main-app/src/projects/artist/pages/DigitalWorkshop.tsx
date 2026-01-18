import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Loader2, 
  Image as ImageIcon,
  Trash2,
  Sparkles
} from "lucide-react"

// Interface matching your 'workshops' table
interface Workshop {
  id: string
  title: string
  description: string
  price: number
  date: string
  start_time: string
  end_time: string
  location: string
  max_participants: number
  current_participants: number
  image_url: string | null
  difficulty_level: string
}

export default function DigitalWorkshop() {
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    max_participants: "10",
    difficulty_level: "Beginner"
  })
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch workshops created by the logged-in artisan
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('artisan_id', user.id)
        .order('date', { ascending: true })

      if (error) throw error
      setWorkshops(data || [])
    } catch (error) {
      console.error("Error fetching workshops:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleCreateWorkshop = async () => {
    // Basic validation
    if (!formData.title || !formData.price || !formData.date || !formData.start_time) {
      alert("Please fill in Title, Price, Date, and Start Time")
      return
    }

    try {
      setUploading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let publicUrl = null

      // 1. Upload Image (if selected)
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `workshop-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('workshop-content') // Ensure this bucket exists in Supabase Storage
          .upload(fileName, selectedFile)
        
        if (uploadError) throw uploadError
        
        const { data } = supabase.storage.from('workshop-content').getPublicUrl(fileName)
        publicUrl = data.publicUrl
      }

      // 2. Insert into 'workshops' table
      const { error } = await supabase
        .from('workshops')
        .insert({
          artisan_id: user.id,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location,
          max_participants: parseInt(formData.max_participants),
          difficulty_level: formData.difficulty_level,
          image_url: publicUrl,
          current_participants: 0
        })

      if (error) throw error

      // Reset Form
      setIsCreateMode(false)
      setFormData({
        title: "", description: "", price: "", date: "", start_time: "", end_time: "", 
        location: "", max_participants: "10", difficulty_level: "Beginner"
      })
      setSelectedFile(null)
      setPreviewUrl(null)
      fetchWorkshops() // Refresh list

    } catch (error) {
      console.error("Error creating workshop:", error)
      alert("Failed to create workshop. Check console for details.")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workshop?")) return
    try {
      const { error } = await supabase.from('workshops').delete().eq('id', id)
      if (error) throw error
      setWorkshops(prev => prev.filter(w => w.id !== id))
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  // Format time (14:00:00 -> 2:00 PM)
  const formatTimeDisplay = (time: string) => {
    if (!time) return ""
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workshop Studio</h1>
          <p className="text-slate-500">Manage your classes and upcoming events</p>
        </div>
        <Button 
          onClick={() => setIsCreateMode(!isCreateMode)} 
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-colors"
        >
          {isCreateMode ? "Close Form" : <><Plus className="w-4 h-4 mr-2" /> Create Workshop</>}
        </Button>
      </div>

      {/* CREATE FORM */}
      {isCreateMode && (
        <Card className="border-2 border-purple-100 bg-purple-50/30 animate-in slide-in-from-top-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
               <Sparkles className="w-5 h-5" /> New Workshop Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Image Upload + Title/Desc */}
            <div className="flex flex-col md:flex-row gap-6">
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full md:w-48 h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 bg-white transition-colors shrink-0"
               >
                 {previewUrl ? (
                   <img src={previewUrl} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                 ) : (
                   <>
                     <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                     <span className="text-xs text-slate-500 font-medium">Add Cover Image</span>
                   </>
                 )}
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>
               
               <div className="flex-1 space-y-4">
                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</label>
                    <Input 
                        name="title" 
                        placeholder="e.g. Masterclass: Traditional Blue Pottery" 
                        value={formData.title} 
                        onChange={handleInputChange} 
                        className="font-medium text-lg bg-white focus-visible:ring-purple-500" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</label>
                    <Textarea 
                        name="description" 
                        placeholder="What will students learn in this session?" 
                        rows={4}
                        value={formData.description} 
                        onChange={handleInputChange} 
                        className="bg-white resize-none focus-visible:ring-purple-500"
                    />
                 </div>
               </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-600">Price (₹)</label>
                 <Input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="2500" className="bg-white focus-visible:ring-purple-500" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-600">Date</label>
                 <Input type="date" name="date" value={formData.date} onChange={handleInputChange} className="bg-white focus-visible:ring-purple-500" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-600">Start Time</label>
                 <Input type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} className="bg-white focus-visible:ring-purple-500" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-600">End Time</label>
                 <Input type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} className="bg-white focus-visible:ring-purple-500" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-600">Location</label>
                 <Input name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Jaipur Studio" className="bg-white focus-visible:ring-purple-500" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-600">Max Students</label>
                 <Input type="number" name="max_participants" value={formData.max_participants} onChange={handleInputChange} className="bg-white focus-visible:ring-purple-500" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-600">Difficulty</label>
                 <Select 
                   value={formData.difficulty_level} 
                   onValueChange={(val) => setFormData(prev => ({...prev, difficulty_level: val}))}
                 >
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                 </Select>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-purple-200">
               <Button variant="ghost" onClick={() => setIsCreateMode(false)}>Cancel</Button>
               <Button onClick={handleCreateWorkshop} disabled={uploading} className="bg-purple-600 hover:bg-purple-700 min-w-[120px]">
                 {uploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} Publish
               </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LIST OF WORKSHOPS */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Your Active Workshops</h2>
        
        {loading ? (
            <div className="text-center py-20"><Loader2 className="animate-spin h-8 w-8 mx-auto text-purple-500" /></div>
        ) : workshops.length === 0 ? (
           <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-900">No workshops yet</h3>
             <p className="text-slate-500 mb-6">Create your first workshop to start teaching.</p>
             <Button onClick={() => setIsCreateMode(true)} variant="outline">Create Now</Button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workshops.map(workshop => (
              <Card key={workshop.id} className="group overflow-hidden hover:shadow-lg transition-all border-slate-200">
                <div className="aspect-video bg-slate-100 relative">
                   <img src={workshop.image_url || "https://placehold.co/600x400?text=Workshop"} className="w-full h-full object-cover" alt={workshop.title} />
                   <div className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded text-sm font-bold shadow-sm">
                     ₹{workshop.price}
                   </div>
                   <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs backdrop-blur-sm uppercase tracking-wide">
                     {workshop.difficulty_level}
                   </div>
                </div>
                <CardContent className="p-5 space-y-4">
                   <div>
                     <h3 className="font-bold text-lg leading-tight group-hover:text-purple-600 transition-colors line-clamp-1">
                       {workshop.title}
                     </h3>
                     <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span>{new Date(workshop.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span>{formatTimeDisplay(workshop.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span className="truncate">{workshop.location}</span>
                        </div>
                     </div>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                     <div className="flex items-center gap-2 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                       <Users className="w-3 h-3" />
                       {workshop.current_participants} / {workshop.max_participants} Students
                     </div>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                       onClick={() => handleDelete(workshop.id)}
                     >
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}