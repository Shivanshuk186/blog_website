import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { BlogsGrid } from "@/components/admin/BlogsGrid";

const Index = () => {
  const [activeTab, setActiveTab] = useState("blogs");

  const renderContent = () => {
    switch (activeTab) {
      case "blogs":
        return <BlogsGrid />;
      case "authors":
        return <div className="p-6 text-center text-muted-foreground">Authors management coming soon...</div>;
      case "reported":
        return <div className="p-6 text-center text-muted-foreground">Reported content management coming soon...</div>;
      case "moderation":
        return <div className="p-6 text-center text-muted-foreground">Moderation tools coming soon...</div>;
      case "tickets":
        return <div className="p-6 text-center text-muted-foreground">Ticket system coming soon...</div>;
      case "analytics":
        return <div className="p-6 text-center text-muted-foreground">Analytics dashboard coming soon...</div>;
      case "deleted":
        return <div className="p-6 text-center text-muted-foreground">Deleted content archive coming soon...</div>;
      default:
        return <BlogsGrid />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminHeader />
      <AdminNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 p-6">
        {renderContent()}
      </main>
      
      <AdminFooter />
    </div>
  );
};

export default Index;
