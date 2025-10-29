import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContentItem as ContentItemType } from "@shared/schema";

interface ContentItemProps {
  item: ContentItemType;
  index: number;
}

export function ContentItem({ item, index }: ContentItemProps) {
  const [expanded, setExpanded] = useState(false);

  const isExpandable = item.category === "Anime" || item.category === "Web Series";

  return (
    <div 
      className="border border-card-border bg-card rounded-md hover-elevate active-elevate-2 transition-all duration-200 hover:shadow-lg"
      data-testid={`card-content-${item._id}`}
    >
      <div 
        className={`flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-4 ${isExpandable ? 'cursor-pointer' : ''}`}
        onClick={() => isExpandable && setExpanded(!expanded)}
      >
        <div className="w-20 h-16 md:w-24 md:h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
          {item.thumbnail ? (
            <img 
              src={item.thumbnail} 
              alt={item.title}
              className="w-full h-full object-cover"
              data-testid={`img-thumbnail-${item._id}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 md:min-w-[200px]">
          <h3 className="font-medium text-foreground truncate" data-testid={`text-title-${item._id}`}>
            {item.title}
          </h3>
        </div>

        <div className="w-full md:w-24 text-muted-foreground text-sm" data-testid={`text-year-${item._id}`}>
          {item.releaseYear || 'N/A'}
        </div>

        <div className="w-full md:w-32 text-muted-foreground text-sm" data-testid={`text-category-${item._id}`}>
          {item.category}
        </div>

        <div className="flex items-center gap-2 w-full md:w-24">
          {item.category === "Movie" && item.driveLink && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.driveLink!, '_blank');
              }}
              className="flex-1 md:flex-initial"
              data-testid={`button-watch-${item._id}`}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Watch
            </Button>
          )}
          {isExpandable && (
            <div className="w-8 flex items-center justify-center ml-auto md:ml-0">
              {expanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
      </div>

      {isExpandable && expanded && item.seasons && (
        <div className="px-4 pb-4 pt-2 border-t border-card-border">
          <div className="space-y-4">
            {item.seasons.map((season) => (
              <div key={season.seasonNumber} className="space-y-2">
                <h4 className="font-medium text-sm text-foreground">
                  Season {season.seasonNumber}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {season.episodes.map((episode) => (
                    <Button
                      key={episode.episodeNumber}
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(episode.link, '_blank')}
                      className="text-xs"
                      data-testid={`button-episode-${item._id}-${season.seasonNumber}-${episode.episodeNumber}`}
                    >
                      E{episode.episodeNumber.toString().padStart(2, '0')}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
