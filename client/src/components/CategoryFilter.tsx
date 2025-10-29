import { Button } from "@/components/ui/button";
import { ComboBox } from "@/components/ui/combobox";
import { Search, Trash2, Edit } from "lucide-react";

interface CategoryFilterProps {
  onCategoryChange: (category: string) => void;
  onSearchClick: () => void;
  onDeleteClick: () => void;
  onEditClick: () => void;
  selectedCategory: string;
}

const categoryOptions = [
  { value: "All Type", label: "All Type" },
  { value: "Movie", label: "Movie" },
  { value: "Anime", label: "Anime" },
  { value: "Web Series", label: "Web Series" },
];

export function CategoryFilter({ 
  onCategoryChange, 
  onSearchClick, 
  onDeleteClick, 
  onEditClick, 
  selectedCategory 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 md:px-6 py-4 bg-card border-b border-border">
      <div className="flex-1 sm:max-w-xs">
        <ComboBox
          options={categoryOptions}
          value={selectedCategory}
          onValueChange={onCategoryChange}
          placeholder="Select Category"
          searchPlaceholder="Search category..."
          testId="select-category"
        />
      </div>
      <div className="flex gap-2 sm:gap-3">
        <Button onClick={onSearchClick} variant="outline" className="flex-1 sm:flex-initial" data-testid="button-search">
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Search</span>
        </Button>
        <Button onClick={onDeleteClick} variant="outline" className="flex-1 sm:flex-initial" data-testid="button-delete">
          <Trash2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
        <Button onClick={onEditClick} variant="outline" className="flex-1 sm:flex-initial" data-testid="button-edit">
          <Edit className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
      </div>
    </div>
  );
}
