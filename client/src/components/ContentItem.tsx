import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { VideoPlayerDialog } from "@/components/VideoPlayerDialog";
import { SeriesPlayerDialog } from "@/components/SeriesPlayerDialog";
import type { ContentItem as ContentItemType } from "@shared/schema";

interface ContentItemProps {
  item: ContentItemType;
}

export function ContentItem({ item }: ContentItemProps) {
  const [showMoviePlayer, setShowMoviePlayer] = useState(false);
  const [showSeriesPlayer, setShowSeriesPlayer] = useState(false);
  const queryClient = useQueryClient();

  const { data: fullContent, isLoading, refetch } = useQuery<ContentItemType>({
    queryKey: ['/api/content', item._id],
    enabled: false,
  });

  const handleClick = async () => {
    const result = await refetch();
    
    if (result.data) {
      if (item.category === "Movie") {
        setShowMoviePlayer(true);
      } else if ((item.seasons && item.seasons.length > 0) || (result.data.seasons && result.data.seasons.length > 0)) {
        setShowSeriesPlayer(true);
      }
    }
  };

  const contentToDisplay = fullContent || item;

  return (
    <>
      <div 
        className="group cursor-pointer"
        onClick={handleClick}
        data-testid={`card-content-${item._id}`}
      >
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-2 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {item.thumbnail ? (
            <img 
              src={item.thumbnail} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              data-testid={`img-thumbnail-${item._id}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              No Image
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {isLoading ? (
                <Loader2 className="h-8 w-8 text-white drop-shadow-lg animate-spin" />
              ) : (
                <ExternalLink className="h-8 w-8 text-white drop-shadow-lg" />
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 
            className="font-semibold text-sm line-clamp-2 text-foreground leading-tight" 
            data-testid={`text-title-${item._id}`}
          >
            {item.title}
          </h3>
          <p 
            className="text-xs text-muted-foreground" 
            data-testid={`text-year-${item._id}`}
          >
            {item.releaseYear || 'N/A'}
          </p>
          <p 
            className="text-xs text-muted-foreground font-medium" 
            data-testid={`text-category-${item._id}`}
          >
            {item.category}
          </p>
        </div>
      </div>

      <VideoPlayerDialog
        open={showMoviePlayer}
        onOpenChange={setShowMoviePlayer}
        item={contentToDisplay}
        videoUrl={contentToDisplay.driveLink}
      />

      <SeriesPlayerDialog
        open={showSeriesPlayer}
        onOpenChange={setShowSeriesPlayer}
        item={contentToDisplay}
      />
    </>
  );
}
