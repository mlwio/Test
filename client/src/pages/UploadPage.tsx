import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertContentItem, Season } from "@shared/schema";

const categoryOptions = [
  { value: "Movie", label: "Movie" },
  { value: "Anime", label: "Anime" },
  { value: "Web Series", label: "Web Series" },
];

const seasonOptions = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `${i + 1} Season${i + 1 > 1 ? "s" : ""}`,
}));

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [category, setCategory] = useState("Movie");
  const [thumbnail, setThumbnail] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [numSeasons, setNumSeasons] = useState(1);
  const [seasons, setSeasons] = useState<{ episodes: string[] }[]>([{ episodes: [""] }]);

  // ✅ Fixed upload mutation with Authorization header
  const uploadMutation = useMutation({
    mutationFn: async (data: InsertContentItem) => {
      const token = localStorage.getItem("token"); // Get token from localStorage

      return await apiRequest("POST", "/api/content", data, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token in request header
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Upload Successful",
        description: `${title} has been added to ${category}`,
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload content",
        variant: "destructive",
      });
    },
  });

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    if (newCategory !== "Movie") {
      setDriveLink("");
      setSeasons([{ episodes: [""] }]);
    }
  };

  const handleNumSeasonsChange = (num: number) => {
    setNumSeasons(num);
    const newSeasons = Array.from({ length: num }, (_, i) =>
      seasons[i] || { episodes: [""] }
    );
    setSeasons(newSeasons);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!releaseYear) {
      toast({
        title: "Validation Error",
        description: "Release Year is required",
        variant: "destructive",
      });
      return;
    }

    const contentData: InsertContentItem = {
      title,
      releaseYear: parseInt(releaseYear),
      category,
      thumbnail,
      driveLink: category === "Movie" ? driveLink : undefined,
      seasons:
        category !== "Movie"
          ? (seasons.map((season, index) => ({
              seasonNumber: index + 1,
              episodes: season.episodes.map((link, episodeIndex) => ({
                episodeNumber: episodeIndex + 1,
                link,
              })),
            })) as Season[])
          : undefined,
    };

    uploadMutation.mutate(contentData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header actionLabel="Home" onActionClick={() => setLocation("/dashboard")} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Upload New Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseYear">Release Year</Label>
                <Input
                  id="releaseYear"
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  min="1900"
                  max="2100"
                  required
                  data-testid="input-release-year"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <ComboBox
                  options={categoryOptions}
                  value={category}
                  onValueChange={handleCategoryChange}
                  placeholder="Select Category"
                  searchPlaceholder="Search category..."
                  testId="select-upload-category"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  required
                  data-testid="input-thumbnail"
                />
              </div>

              {category === "Movie" ? (
                <div className="space-y-2">
                  <Label htmlFor="driveLink">Video Link</Label>
                  <Input
                    id="driveLink"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    required
                    data-testid="input-drive-link"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="numSeasons">Number of Seasons</Label>
                    <ComboBox
                      options={seasonOptions}
                      value={numSeasons.toString()}
                      onValueChange={(val) => handleNumSeasonsChange(parseInt(val))}
                      placeholder="Select number of seasons"
                      searchPlaceholder="Search seasons..."
                      testId="select-num-seasons"
                    />
                  </div>

                  <div className="space-y-6">
                    {seasons.map((season, seasonIndex) => (
                      <Card key={seasonIndex}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Season {seasonIndex + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {season.episodes.map((episode, episodeIndex) => (
                            <div key={episodeIndex} className="flex gap-2 items-center">
                              <Label className="w-16 text-sm">
                                E{(episodeIndex + 1).toString().padStart(2, "0")}
                              </Label>
                              <Input
                                value={episode}
                                onChange={(e) =>
                                  updateEpisode(seasonIndex, episodeIndex, e.target.value)
                                }
                                required
                                data-testid={`input-episode-${seasonIndex}-${episodeIndex}`}
                              />
                              {season.episodes.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeEpisode(seasonIndex, episodeIndex)
                                  }
                                  data-testid={`button-remove-episode-${seasonIndex}-${episodeIndex}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addEpisode(seasonIndex)}
                            className="w-full"
                            data-testid={`button-add-episode-${seasonIndex}`}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Episode
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={uploadMutation.isPending}
                data-testid="button-submit-upload"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Content"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
