import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BlogContentPreview } from './BlogContentPreview';

interface BlogPostPreviewProps {
  title: string;
  content: string;
  coverImage?: string;
  excerpt?: string;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
}

function estimateReadTime(content: string) {
  const text = content.replace(/<[^>]*>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function BlogPostPreview({
  title,
  content,
  coverImage,
  excerpt,
  authorName,
  authorAvatarUrl,
}: BlogPostPreviewProps) {
  const today = new Date();

  if (!title && !content) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Nothing to preview yet. Add a title and content to see how your post will look.
      </p>
    );
  }

  const authorInitials =
    (authorName || 'Author')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'A';

  return (
    <div className="bg-background rounded-lg">
      {/* Header */}
      <header className="mb-6">
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-3">
          {title || 'Untitled Post'}
        </h1>

        {(authorName || authorAvatarUrl) && (
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={authorAvatarUrl ?? undefined} alt={authorName ?? 'Author'} />
              <AvatarFallback>{authorInitials}</AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">{authorName || 'Author'}</p>
              <p className="text-xs text-muted-foreground">Author</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(today, 'MMMM d, yyyy')}
          </span>
          {content && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {estimateReadTime(content)}
            </span>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {coverImage && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <img
            src={coverImage}
            alt={title || 'Cover image'}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Excerpt */}
      {excerpt && (
        <p className="text-muted-foreground italic mb-6 text-base leading-relaxed border-l-4 border-primary pl-4">
          {excerpt}
        </p>
      )}

      {/* Content */}
      {content ? (
        <BlogContentPreview html={content} />
      ) : (
        <p className="text-sm text-muted-foreground">No content yet.</p>
      )}
    </div>
  );
}
