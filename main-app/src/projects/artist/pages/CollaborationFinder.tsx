import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { collabService } from "../services/collabService";
import { ArtisanCard } from "../components/collaboration/ArtisanCard";
import { ProjectRequestCard } from "../components/collaboration/ProjectRequestCard";
import { CollaborationManagementCard } from "../components/collaboration/CollaborationManagementCard";
import { PostProjectModal } from "../components/collaboration/PostProjectModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function CollaborationFinder() {
  const [activeTab, setActiveTab] = useState('find');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user to determine if they are the owner of a project
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === 'find') {
        data = await collabService.getArtisans();
      } else if (activeTab === 'requests') {
        data = await collabService.getProjects();
      } else {
        // Fetches requests where user is either the owner OR the applicant
        data = await collabService.getMyCollaborations();
      }
      setItems(data || []);
    } catch (err) {
      console.error("Error loading data:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Search filter logic for all three tabs
  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    if (activeTab === 'find') {
      return item.profiles?.full_name?.toLowerCase().includes(query) || item.craft?.toLowerCase().includes(query);
    } else if (activeTab === 'requests') {
      return item.title?.toLowerCase().includes(query) || item.profiles?.full_name?.toLowerCase().includes(query);
    } else {
      // Search by project title or applicant name in My Collaborations
      return (
        item.post?.title?.toLowerCase().includes(query) ||
        item.applicant?.full_name?.toLowerCase().includes(query) ||
        item.post?.profiles?.full_name?.toLowerCase().includes(query)
      );
    }
  });

  return (
    <div className="flex-1 bg-[#F9FAFB] min-h-screen p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collaboration Finder</h1>
          <p className="text-sm text-gray-500">Find partners for your next masterpiece</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#7C3AED] hover:bg-[#6D28D9] rounded-2xl h-12 px-6 shadow-lg shadow-purple-100">
          <Plus size={20} className="mr-2" /> Post Project
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-8">
        {[
          { id: 'find', label: 'Find Artisans' },
          { id: 'requests', label: 'Project Requests' },
          { id: 'history', label: 'My Collaborations' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === tab.id ? 'text-[#7C3AED]' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, craft, or project title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-white shadow-sm outline-none focus:ring-2 focus:ring-purple-100 transition-all"
        />
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">Loading collaborations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'find' && filteredItems.map(artisan => (
            <ArtisanCard key={artisan.id} artisan={artisan} />
          ))}

          {activeTab === 'requests' && filteredItems.map(project => (
            <div key={project.id} className="col-span-full">
              <ProjectRequestCard
                project={project}
                onRefresh={loadData} // Refreshes applicant count
              />
            </div>
          ))}

          {/* Logic for My Collaborations Tab */}
          {activeTab === 'history' && (
            <div className="col-span-full">
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredItems.map(request => (
                    <CollaborationManagementCard
                      key={request.id}
                      request={request}
                      currentUserId={currentUserId} // Used to show owner actions
                      onRefresh={loadData}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <Users className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-medium">No collaborations found yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal for posting projects */}
      <PostProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={loadData}
      />
    </div>
  );
}