import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string, category: string) => void;
}

export function SearchDialog({ open, onOpenChange, onSearch }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("Movie");

  const handleSearch = () => {
    onSearch(searchQuery, searchCategory);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-search">
        <DialogHeader>
          <DialogTitle>Search Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={searchCategory} onValueChange={setSearchCategory}>
              <SelectTrigger data-testid="select-search-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Movie">Movie</SelectItem>
                <SelectItem value="Anime">Anime</SelectItem>
                <SelectItem value="Web Series">Web Series</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch();
              }}
              data-testid="input-search-query"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
