import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ContentItem } from "@shared/schema";

interface SeriesPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContentItem | null;
}

export function SeriesPlayerDialog({ open, onOpenChange, item }: SeriesPlayerDialogProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<{ seasonNum: number; episodeNum: number; link: string } | null>(null);

  if (!item || !item.seasons) return null;

  const getEmbedUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/[-\w]{25,}/)?.[0];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return url;
  };

  const handleEpisodeClick = (seasonNum: number, episodeNum: number, link: string) => {
    setSelectedEpisode({ seasonNum, episodeNum, link });
  };

  const handleBack = () => {
    setSelectedEpisode(null);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        setSelectedEpisode(null);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold">
            {item.title} {item.releaseYear && `(${item.releaseYear})`}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{item.category}</p>
        </DialogHeader>
        
        {selectedEpisode ? (
          <div className="flex-1 flex flex-col">
            <div className="px-6 pb-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBack}
                data-testid="button-back-to-episodes"
              >
                ← Back to Episodes
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Season {selectedEpisode.seasonNum} • Episode {selectedEpisode.episodeNum}
              </p>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={getEmbedUrl(selectedEpisode.link)}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                data-testid={`video-player-s${selectedEpisode.seasonNum}-e${selectedEpisode.episodeNum}`}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-6">
              {item.seasons.map((season) => (
                <div key={season.seasonNumber} className="space-y-3">
                  <h3 className="font-semibold text-base">
                    Season {season.seasonNumber}
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {season.episodes.map((episode) => (
                      <Button
                        key={episode.episodeNumber}
                        variant="outline"
                        size="sm"
                        onClick={() => handleEpisodeClick(season.seasonNumber, episode.episodeNumber, episode.link)}
                        className="text-xs h-9"
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
      </DialogContent>
    </Dialog>
  );
}
