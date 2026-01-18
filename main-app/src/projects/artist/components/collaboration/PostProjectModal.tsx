import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Layout, Clock, Wallet, PenTool } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const PostProjectModal = ({ isOpen, onClose, onRefresh }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: '',
    skills_needed: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('collaboration_posts')
        .insert([{
          creator_id: user?.id,
          title: formData.title,
          description: formData.description,
          budget: formData.budget,
          timeline: formData.timeline,
          skills_needed: formData.skills_needed.split(',').map(s => s.trim())
        }]);

      if (error) throw error;
      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-purple-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Post New Project</h2>
            <p className="text-xs text-purple-600 font-medium">Find collaborators for your craft</p>
          </div>
          {/* <button 
                onClick={onClose} 
                className="p-2 hover:bg-white rounded-full transition-colors"
                aria-label="Close modal" // Fixes the discernible text error
                title="Close"            // Provides a hover tooltip
                >
                <X size={20} className="text-gray-400" />
            </button> */}

          <button
            onClick={onClose}
            aria-label="Close modal"
            title="Close"
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
              <Layout size={12} /> Project Title
            </label>
            <input
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
              placeholder="e.g. Wedding Silk Saree Collection"
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
                <Wallet size={12} /> Budget Range
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                placeholder="₹10k - ₹20k"
                onChange={e => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
                <Clock size={12} /> Timeline
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                placeholder="2-4 weeks"
                onChange={e => setFormData({ ...formData, timeline: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
              <PenTool size={12} /> Skills (comma separated)
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
              placeholder="Weaving, Dyeing, Embroidery"
              onChange={e => setFormData({ ...formData, skills_needed: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Description</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
              placeholder="Tell artisans what you are looking for..."
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <Button
            disabled={loading}
            className="w-full h-14 bg-purple-600 hover:bg-purple-700 rounded-2xl text-lg font-bold shadow-lg shadow-purple-100 mt-4"
          >
            {loading ? "Posting..." : "Create Project"}
          </Button>
        </form>
      </div>
    </div>
  );
};