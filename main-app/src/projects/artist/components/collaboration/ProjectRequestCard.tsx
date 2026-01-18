import React, { useState } from 'react';
import { Users, Wallet, Clock, Eye } from 'lucide-react';
import { collabService } from "../../services/collabService";
import { Button } from "@/components/ui/button";

export const ProjectRequestCard = ({ project, onRefresh }: any) => {
  const [loading, setLoading] = useState(false);

  // Updated to use the count object returned by your new query
  const applicantCount = project.project_requests?.[0]?.count || 0;

  const handleApply = async () => {
    setLoading(true);
    try {
      // Message sent silently as requested
      await collabService.applyToProject(project.id, "I would like to collaborate.");

      // Feedback is crucial so the user knows it worked
      //alert("Application sent successfully!");

      if (onRefresh) onRefresh();
    } catch (err: any) {
      // Handles the unique constraint you added in Supabase
      if (err.message?.includes("already applied")) {
        alert("You have already applied for this project.");
      } else {
        console.error("Application error:", err);
        alert("Failed to apply. You might be the project owner or there's a connection issue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm relative overflow-hidden mb-4">
      {/* Header Section: Now correctly displays the owner name */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{project.title}</h3>
          <p className="text-xs text-gray-400 mt-1">
            by <span className="text-purple-600 font-semibold">
              {project.profiles?.full_name || 'Artisan'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-50 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full border">
          <Users size={12} /> {applicantCount} applicants
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        {project.description}
      </p>

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-50/50 p-4 rounded-xl border border-gray-50">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1 mb-1">
            <Wallet size={10} /> Budget
          </p>
          <p className="text-sm font-semibold text-gray-900">{project.budget}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1 mb-1">
            <Clock size={10} /> Timeline
          </p>
          <p className="text-sm font-semibold text-gray-900">{project.timeline}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Skills Needed</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {project.skills_needed?.map((skill: string) => (
              <span key={skill} className="bg-white text-[10px] px-2 py-0.5 rounded border border-gray-100 text-gray-600">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <Button variant="ghost" className="text-gray-400 gap-2 hover:bg-transparent hover:text-gray-600">
          <Eye size={18} /> View Details
        </Button>
        <Button
          onClick={handleApply}
          disabled={loading} // Fixed: was using isApplying, now using loading
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 rounded-xl font-medium transition-all active:scale-95"
        >
          {loading ? "Sending..." : "Apply for Collaboration"}
        </Button>
      </div>
    </div>
  );
};