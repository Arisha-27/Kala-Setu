// src/projects/artist/services/collabService.ts
import { supabase } from "@/lib/supabase";

export const collabService = {
  async getArtisans() {
    const { data, error } = await supabase
      .from('artisans')
      .select(`
        *,
        profiles:id (full_name, avatar_url)
      `) // Location removed from select
      .order('rating', { ascending: false });
    if (error) throw error;
    return data;
  },



  async getProjects() {
    const { data, error } = await supabase
      .from('collaboration_posts')
      .select(`
        *,
        profiles:creator_id (full_name, avatar_url),
        project_requests(count) 
      `) // Added count for the top-right badge
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },


  // Option 4: Create new project
  async createProject(projectData: any) {
    const { data, error } = await supabase
      .from('collaboration_posts')
      .insert([projectData]);
    if (error) throw error;
    return data;
  },



  async getMyCollaborations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    /**
     * FIX: Supabase .or() cannot easily filter on joined table columns 
     * across different relationships in a single simple string. 
     * We fetch all requests where the user is involved.
     */
    const { data, error } = await supabase
      .from('project_requests')
      .select(`
      *,
      post:post_id (
        id,
        title,
        creator_id,
        profiles:creator_id (id, full_name, avatar_url)
      ),
      applicant:applicant_id (id, full_name, avatar_url)
    `);

    if (error) throw error;

    // Filter manually to ensure the user only sees what they are involved in
    return data.filter(request =>
      request.applicant_id === user.id ||
      request.post?.creator_id === user.id
    );
  },

  async applyToProject(postId: string, message: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please login to apply");

    const { data, error } = await supabase
      .from('project_requests')
      .insert([{
        post_id: postId,
        applicant_id: user.id,
        message: message,
        status: 'pending'
      }]);
    if (error) throw error;
    return data;
  },


  //   new
  async updateRequestStatus(requestId: string, status: 'accepted' | 'rejected') {
    const { data, error } = await supabase
      .from('project_requests')
      .update({ status })
      .eq('id', requestId);
    if (error) throw error;
    return data;
  }
};