import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/components/ui/combobox";
import type { ContentItem, Season } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Trash2 } from "lucide-react";

const categoryOptions = [
  { value: "Movie", label: "Movie" },
  { value: "Anime", label: "Anime" },
  { value: "Web Series", label: "Web Series" },
];

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ContentItem[];
}

export function EditDialog({ open, onOpenChange, items }: EditDialogProps) {
  const [selectedItemId, setSelectedItemId] = useState("");
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [category, setCategory] = useState("Movie");
  const [thumbnail, setThumbnail] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [seasons, setSeasons] = useState<{ episodes: string[] }[]>([{ episodes: [""] }]);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"select" | "edit">("select");

  const queryClient = useQueryClient();

  const selectedItem = items.find((item) => item._id === selectedItemId);
  
  const itemOptions = items.map((item) => ({
    value: item._id,
    label: `${item.title} (${item.category})`,
  }));

  useEffect(() => {
    if (selectedItem && step === "edit") {
      setTitle(selectedItem.title);
      setReleaseYear(selectedItem.releaseYear ? selectedItem.releaseYear.toString() : "");
      setCategory(selectedItem.category);
      setThumbnail(selectedItem.thumbnail);
      setDriveLink(selectedItem.driveLink || "");
      
      if (selectedItem.seasons && selectedItem.seasons.length > 0) {
        setSeasons(
          selectedItem.seasons.map((season) => ({
            episodes: season.episodes.map((ep) => ep.link),
          }))
        );
      } else {
        setSeasons([{ episodes: [""] }]);
      }
    }
  }, [selectedItem, step]);

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; content: any }) => {
      const response = await fetch(`/api/content/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.content),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update content");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      handleClose();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleClose = () => {
    setSelectedItemId("");
    setTitle("");
    setReleaseYear("");
    setCategory("Movie");
    setThumbnail("");
    setDriveLink("");
    setSeasons([{ episodes: [""] }]);
    setError("");
    setStep("select");
    onOpenChange(false);
  };

  const handleNext = () => {
    if (!selectedItemId) {
      setError("Please select an item to edit");
      return;
    }
    setError("");
    setStep("edit");
  };

  const handleUpdate = () => {
    if (!title || !thumbnail || !releaseYear) {
      setError("Please fill in all required fields");
      return;
    }

    if (category === "Movie" && !driveLink) {
      setError("Please enter a drive link for movies");
      return;
    }

    const contentData = {
      title,
      releaseYear: parseInt(releaseYear),
      category,
      thumbnail,
      driveLink: category === "Movie" ? driveLink : undefined,
      seasons:
        category !== "Movie"
          ? seasons.map((season, index) => ({
              seasonNumber: index + 1,
              episodes: season.episodes.map((link, episodeIndex) => ({
                episodeNumber: episodeIndex + 1,
                link,
              })),
            })) as Season[]
          : undefined,
    };

    updateMutation.mutate({ id: selectedItemId, content: contentData });
  };

  const addEpisode = (seasonIndex: number) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes.push("");
    setSeasons(newSeasons);
  };

  const removeEpisode = (seasonIndex: number, episodeIndex: number) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes.splice(episodeIndex, 1);
    setSeasons(newSeasons);
  };

  const updateEpisode = (seasonIndex: number, episodeIndex: number, value: string) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes[episodeIndex] = value;
    setSeasons(newSeasons);
  };

  const addSeason = () => {
    setSeasons([...seasons, { episodes: [""] }]);
  };

  const removeSeason = (seasonIndex: number) => {
    const newSeasons = [...seasons];
    newSeasons.splice(seasonIndex, 1);
    setSeasons(newSeasons);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto sm:max-w-[90vw]" data-testid="dialog-edit">
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "Select Item to Edit" : `Edit: ${selectedItem?.title}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "select" ? (
            <div className="space-y-2">
              <Label>Select Content Item</Label>
              <ComboBox
                options={itemOptions}
                value={selectedItemId}
                onValueChange={setSelectedItemId}
                placeholder="Choose item to edit"
                searchPlaceholder="Search items..."
                testId="select-edit-item"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  data-testid="input-edit-title"
                />
              </div>

              <div className="space-y-2">
                <Label>Release Year</Label>
                <Input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  min="1900"
                  max="2100"
                  required
                  data-testid="input-edit-release-year"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <ComboBox
                  options={categoryOptions}
                  value={category}
                  onValueChange={setCategory}
                  placeholder="Select Category"
                  searchPlaceholder="Search category..."
                  testId="select-edit-category"
                />
              </div>

              <div className="space-y-2">
                <Label>Thumbnail URL</Label>
                <Input
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="Enter thumbnail URL"
                  data-testid="input-edit-thumbnail"
                />
              </div>

              {category === "Movie" ? (
                <div className="space-y-2">
                  <Label>Drive Link</Label>
                  <Input
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    placeholder="Enter Google Drive link"
                    data-testid="input-edit-drive-link"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Seasons and Episodes</Label>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addSeason}
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Season
                    </Button>
                  </div>

                  {seasons.map((season, seasonIndex) => (
                    <div key={seasonIndex} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">
                          Season {seasonIndex + 1}
                        </Label>
                        {seasons.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSeason(seasonIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {season.episodes.map((episode, episodeIndex) => (
                        <div key={episodeIndex} className="flex gap-2 items-center">
                          <Label className="w-16 text-sm">E{episodeIndex + 1}</Label>
                          <Input
                            value={episode}
                            onChange={(e) =>
                              updateEpisode(seasonIndex, episodeIndex, e.target.value)
                            }
                            placeholder="Episode link"
                          />
                          {season.episodes.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeEpisode(seasonIndex, episodeIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addEpisode(seasonIndex)}
                        variant="outline"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Episode
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {step === "select" ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNext} data-testid="button-edit-next">
                Next
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                data-testid="button-edit-save"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
