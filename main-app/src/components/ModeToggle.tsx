import React from "react";
import { Button } from "@/components/ui/button";
import { Palette, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom"; // Add this

interface ModeToggleProps {
  mode: "user" | "artist";
  onModeChange: (mode: "user" | "artist") => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
  const navigate = useNavigate(); // Initialize navigate

  const handleSelection = (newMode: "user" | "artist") => {
    onModeChange(newMode);
    // Navigate to the correct route based on selection
    if (newMode === "user") {
      navigate("/customer");
    } else {
      navigate("/artist");
    }
  };

  return (
    <div className="flex items-center bg-background border border-border rounded-2xl p-2 shadow-card">
      <Button
        variant={mode === "user" ? "hero" : "ghost"}
        size="lg"
        onClick={() => handleSelection("user")} // Use the new handler
        className={cn(
          "flex-1 rounded-xl transition-all duration-300",
          mode === "user" 
            ? "shadow-elegant" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Users className="h-5 w-5 mr-2" />
        I'm a Customer
      </Button>
      
      <Button
        variant={mode === "artist" ? "hero" : "ghost"}
        size="lg"
        onClick={() => handleSelection("artist")} // Use the new handler
        className={cn(
          "flex-1 rounded-xl transition-all duration-300",
          mode === "artist" 
            ? "shadow-elegant" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Palette className="h-5 w-5 mr-2" />
        I'm an Artisan
      </Button>
    </div>
  );
};

export default ModeToggle;