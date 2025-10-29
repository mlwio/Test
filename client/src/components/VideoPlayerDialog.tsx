import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ContentItem } from "@shared/schema";

interface VideoPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContentItem | null;
  videoUrl?: string;
}

export function VideoPlayerDialog({ open, onOpenChange, item, videoUrl }: VideoPlayerDialogProps) {
  if (!item) return null;

  const getEmbedUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/[-\w]{25,}/)?.[0];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return url;
  };

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold">
            {item.title} {item.releaseYear && `(${item.releaseYear})`}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{item.category}</p>
        </DialogHeader>
        
        <div className="aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              data-testid={`video-player-${item._id}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <p>Video URL not available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
