import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogCard } from "./BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Blog {
  id: string;
  title: string;
  content_html: string;
  status: string;
  created_at: string;
  published_at?: string;
  author_id: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  tags?: string[];
  cover_image_url?: string;
}

interface Profile {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export function BlogsGrid() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [realTimeCount, setRealTimeCount] = useState(0);
  const { toast } = useToast();

  const fetchBlogs = async () => {
    try {
      console.log('Fetching blogs via admin-blogs edge function...');

      const { data, error } = await supabase.functions.invoke('admin-blogs', {
        body: { action: 'list' }
      });

      if (error) {
        console.error('admin-blogs list error:', error);
        throw error;
      }

      const blogsData = (data as any)?.blogs || [];
      console.log('Blogs data (admin):', blogsData);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      setBlogs(blogsData);
      setProfiles(profilesData || []);
      
      toast({
        title: "Data Refreshed",
        description: `Loaded ${blogsData.length} blogs and ${profilesData?.length || 0} profiles.`,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blogs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();

    // Real-time subscription
    const channel = supabase
      .channel('admin-blogs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blogs'
        },
        (payload) => {
          console.log('Real-time blog change:', payload);
          setRealTimeCount(prev => prev + 1);
          
          if (payload.eventType === 'INSERT') {
            setBlogs(prev => [payload.new as Blog, ...prev]);
            toast({
              title: "New Blog Posted!",
              description: `"${(payload.new as Blog).title}" has been published.`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setBlogs(prev => prev.map(blog => 
              blog.id === payload.new.id ? payload.new as Blog : blog
            ));
          } else if (payload.eventType === 'DELETE') {
            setBlogs(prev => prev.filter(blog => blog.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content_html.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (id: string) => {
    toast({
      title: "Edit Blog",
      description: `Editing blog ${id}`,
    });
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-blogs', {
        body: { action: 'approve', id }
      });

      if (error) throw error;

      toast({
        title: "Blog Approved",
        description: "Blog has been successfully published.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve blog.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-blogs', {
        body: { action: 'reject', id, reason: 'Rejected by admin' }
      });

      if (error) throw error;

      toast({
        title: "Blog Rejected",
        description: "Blog has been rejected.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject blog.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-blogs', {
        body: { action: 'delete', id }
      });

      if (error) throw error;

      toast({
        title: "Blog Deleted",
        description: "Blog has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog.",
        variant: "destructive",
      });
    }
  };

  const handleBan = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-blogs', {
        body: { action: 'ban', id }
      });

      if (error) throw error;

      toast({
        title: "Blog Banned",
        description: "Blog has been banned and marked as rejected.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ban blog.",
        variant: "destructive",
      });
    }
  };

  const handleRaiseTicket = (authorId: string) => {
    const author = profiles.find(p => p.user_id === authorId);
    toast({
      title: "Ticket Raised",
      description: `Ticket raised for author: ${author?.name || 'Unknown'}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with real-time indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live ({realTimeCount} updates)
          </Badge>
        </div>
        
        <Button onClick={fetchBlogs} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-foreground">{blogs.length}</div>
          <div className="text-sm text-muted-foreground">Total Blogs</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{blogs.filter(b => b.status === 'submitted').length}</div>
          <div className="text-sm text-muted-foreground">Submitted</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{blogs.filter(b => b.status === 'published').length}</div>
          <div className="text-sm text-muted-foreground">Published</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{blogs.filter(b => b.status === 'draft').length}</div>
          <div className="text-sm text-muted-foreground">Drafts</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{blogs.filter(b => b.status === 'rejected').length}</div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredBlogs.length} of {blogs.length} blogs
      </div>

      {/* Blogs Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No blogs found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "No blogs have been created yet"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => {
            const author = profiles.find(p => p.user_id === blog.author_id);
            return (
              <BlogCard
                key={blog.id}
                blog={blog}
                author={author}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBan={handleBan}
                onRaiseTicket={handleRaiseTicket}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}