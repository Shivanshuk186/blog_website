import { Heart } from "lucide-react";

export function AdminFooter() {
  return (
    <footer className="bg-card border-t border-border px-6 py-4 mt-auto">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>© 2024 Devnovate. All rights reserved.</span>
          <span>Admin Dashboard v1.0</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-destructive fill-current" />
          <span>for content creators</span>
        </div>
      </div>
    </footer>
  );
}