import React, { useState } from 'react';
import { Check, X, Clock, User, Briefcase, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collabService } from "../../services/collabService";

interface CollaborationManagementCardProps {
  request: any;
  isOwner: boolean; // True if current user created the project
  onRefresh: () => void;
}


export const CollaborationManagementCard = ({ request, currentUserId, onRefresh }: any) => {
  const [loading, setLoading] = useState(false);

  // Identify the roles
  const isOwner = request.post?.creator_id === currentUserId;
  const isApplicant = request.applicant_id === currentUserId;

  const handleStatusUpdate = async (newStatus: 'accepted' | 'rejected') => {
    setLoading(true);
    try {
      await collabService.updateRequestStatus(request.id, newStatus);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  // Logic for distinct visual badges
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Accepted',
          classes: 'bg-green-50 text-green-700 border-green-200',
          icon: <Check size={12} />
        };
      case 'rejected':
        return {
          label: 'Declined',
          classes: 'bg-red-50 text-red-700 border-red-200',
          icon: <X size={12} />
        };
      default:
        return {
          label: 'Pending',
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock size={12} />
        };
    }
  };

  const statusStyle = getStatusConfig(request.status);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

        {/* Info Section */}
        <div className="flex items-start gap-4">
          <img
            src={request.applicant?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"}
            className="w-14 h-14 rounded-full border-2 border-purple-50"
            alt="Applicant"
          />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h4 className="font-bold text-gray-900 text-lg">
                {isOwner ? request.applicant?.full_name : "You applied for this project"}
              </h4>
              <span className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${statusStyle.classes}`}>
                {statusStyle.icon} {statusStyle.label}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Briefcase size={14} className="text-purple-400" />
              <span>Project: <span className="font-semibold text-gray-700">{request.post?.title}</span></span>
            </div>
          </div>
        </div>



        <div className="flex items-center gap-3">
          {request.status === 'pending' ? (
            isOwner ? (
              <div className="flex gap-2">
                <Button onClick={() => handleStatusUpdate('accepted')} className="bg-green-600 h-9 px-4 rounded-xl">Accept</Button>
                <Button onClick={() => handleStatusUpdate('rejected')} variant="outline" className="text-red-500 h-9 px-4 rounded-xl">Reject</Button>
              </div>
            ) : (
              <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-100">PENDING</span>
            )
          ) : (
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${request.status === 'accepted' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
              {request.status.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Message Tooltip/Box */}
      {request.message && (
        <div className="mt-4 pl-16">
          <div className="bg-purple-50/30 border border-purple-50 rounded-2xl p-4">
            <p className="text-xs text-gray-600 leading-relaxed italic">
              " {request.message} "
            </p>
          </div>
        </div>
      )}
    </div>
  );
};