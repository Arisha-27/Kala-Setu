import { useState } from "react"
import { useNavigate } from "react-router-dom" // 👈 Import navigation
import { supabase } from "@/lib/supabase" // 👈 Import Supabase client
import { generateListingFromImage } from "@/projects/artist/lib/gemini"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Sparkles,
  Image as ImageIcon,
  Tag,
  DollarSign,
  FileText,
  Wand2,
  CheckCircle2,
  Loader2 // 👈 Import Loader
} from "lucide-react"

export default function AIListingGenerator() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([])
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    price: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false) // 👈 State for publishing status

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])
    if (uploadedFiles.length > 0) {
      setFiles(prev => [...prev, ...uploadedFiles])
    }
  }

  const generateListing = async () => {
    if (files.length === 0) return;

    setIsGenerating(true)

    const result = await generateListingFromImage(files[0]);

    if (result) {
      setGeneratedContent({
        title: result.title || "",
        description: result.description || "",
        tags: result.tags || [],
        price: result.price?.toString() || ""
      })
    } else {
      alert("AI Generation failed. Please try again.");
    }

    setIsGenerating(false)
  }

  // 👇 NEW: Handle Saving to Database
  const handlePublish = async () => {
    if (!generatedContent.title || files.length === 0) {
      alert("Please upload an image and generate content first.");
      return;
    }

    try {
      setIsPublishing(true);

      // 1. Get Current User (Artisan)
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in to publish.");
        return;
      }

      // 2. Upload Image to Supabase Storage
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Make sure you have a bucket named 'product-images' created in Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // 4. Insert into Products Table
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          artisan_id: user.id,
          name: generatedContent.title,
          description: generatedContent.description,
          price: parseFloat(generatedContent.price) || 0,
          stock: 1, // Default stock
          category: generatedContent.tags[0] || "Handicraft", // Use first tag as category
          image_url: publicUrl,
          tags: generatedContent.tags,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      alert("Product published successfully!");
      navigate('/artist/listings'); // Redirect to dashboard after success

    } catch (error: any) {
      console.error("Error publishing product:", error);
      alert("Failed to publish: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center border border-purple-200">
          <Wand2 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Listing Generator</h1>
          <p className="text-slate-500 text-lg">Upload your product photo and let AI write the perfect listing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Upload className="w-5 h-5 text-purple-600" />
                Step 1: Upload Media
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center bg-slate-50/50 hover:bg-purple-50/50 hover:border-purple-200 transition-all duration-200">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer w-full h-full block">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100">
                      <ImageIcon className="w-7 h-7 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-slate-700">
                        Click to upload photo
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        JPG, PNG (Max 10MB)
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {files.length > 0 && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded-md shadow-sm">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-purple-900 truncate flex-1">
                    {files[0].name}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                </div>
              )}

              <Button
                onClick={generateListing}
                disabled={files.length === 0 || isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg font-medium shadow-md shadow-purple-200 transition-all"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Magic in progress...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Generate Listing
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm h-full">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <FileText className="w-5 h-5 text-purple-600" />
                Step 2: Review Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Product Title</label>
                <Input
                  value={generatedContent.title}
                  onChange={(e) => setGeneratedContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Waiting for magic..."
                  className="h-11 border-slate-200 focus-visible:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Description</label>
                <Textarea
                  value={generatedContent.description}
                  onChange={(e) => setGeneratedContent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="AI will craft a compelling story about your product here..."
                  rows={8}
                  className="border-slate-200 focus-visible:ring-purple-500 leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" /> Smart Tags
                </label>
                <div className="flex flex-wrap gap-2 min-h-[44px] p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                  {generatedContent.tags.length > 0 ? (
                    generatedContent.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 px-2.5 py-1"
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : <span className="text-sm text-slate-400 italic">Tags will appear here</span>}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" /> Suggested Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <Input
                    value={generatedContent.price}
                    onChange={(e) => setGeneratedContent(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    className="h-11 pl-8 border-slate-200 focus-visible:ring-purple-500 font-mono text-lg font-medium"
                  />
                </div>
              </div>

              {/* 👇 UPDATED: Publish Button with Loading State */}
              <Button
                onClick={handlePublish}
                disabled={isPublishing || !generatedContent.title}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 mt-2 font-medium"
              >
                {isPublishing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publishing to Shop...
                  </div>
                ) : (
                  "Save & Publish Listing"
                )}

              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}