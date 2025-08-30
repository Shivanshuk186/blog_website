import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  Flag, 
  Trash2, 
  Shield, 
  BarChart3,
  MessageSquare
} from "lucide-react";

const navItems = [
  { icon: FileText, label: "All Blogs", id: "blogs", active: true },
  { icon: Users, label: "Authors", id: "authors" },
  { icon: Flag, label: "Reported", id: "reported" },
  { icon: Shield, label: "Moderation", id: "moderation" },
  { icon: MessageSquare, label: "Tickets", id: "tickets" },
  { icon: BarChart3, label: "Analytics", id: "analytics" },
  { icon: Trash2, label: "Deleted", id: "deleted" },
];

interface AdminNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminNavbar({ activeTab, onTabChange }: AdminNavbarProps) {
  return (
    <nav className="bg-card border-b border-border px-6 py-3">
      <div className="flex space-x-1 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center space-x-2 whitespace-nowrap",
                activeTab === item.id && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}