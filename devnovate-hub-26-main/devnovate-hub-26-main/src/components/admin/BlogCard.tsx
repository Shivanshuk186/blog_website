import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Ban, 
  Flag, 
  Eye, 
  Heart, 
  MessageSquare,
  User,
  Calendar,
  AlertTriangle,
  Check,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BlogCardProps {
  blog: {
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
  };
  author?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onBan: (id: string) => void;
  onRaiseTicket: (authorId: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function BlogCard({ blog, author, onEdit, onDelete, onBan, onRaiseTicket, onApprove, onReject }: BlogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'submitted': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const truncateContent = (html: string, length: number = 150) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{blog.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{author?.name || 'Unknown Author'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(blog.status)}>{blog.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(blog.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                
                {(blog.status === 'draft' || blog.status === 'submitted') && onApprove && (
                  <DropdownMenuItem onClick={() => onApprove(blog.id)} className="text-green-600">
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                )}
                
                {blog.status !== 'rejected' && onReject && (
                  <DropdownMenuItem onClick={() => onReject(blog.id)} className="text-orange-600">
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={() => onBan(blog.id)} className="text-orange-600">
                  <Ban className="mr-2 h-4 w-4" />
                  Ban Blog
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRaiseTicket(blog.author_id)} className="text-yellow-600">
                  <Flag className="mr-2 h-4 w-4" />
                  Raise Ticket
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(blog.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {blog.cover_image_url && (
          <img 
            src={blog.cover_image_url} 
            alt={blog.title}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        )}
        
        <div className="mb-4">
          <p className="text-muted-foreground">
            {isExpanded ? blog.content_html.replace(/<[^>]*>/g, '') : truncateContent(blog.content_html)}
          </p>
          {blog.content_html.length > 150 && (
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0 h-auto text-primary"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </Button>
          )}
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {blog.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{blog.views_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{blog.likes_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{blog.comments_count}</span>
            </div>
          </div>
          
          {blog.status === 'rejected' && (
            <div className="flex items-center space-x-1 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Rejected</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}