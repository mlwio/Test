import { ContentItem } from "./ContentItem";
import type { ContentItem as ContentItemType } from "@shared/schema";

interface ContentListProps {
  items: ContentItemType[];
  category: string;
}

export function ContentList({ items, category }: ContentListProps) {
  const filteredItems = category === "All Type" 
    ? items 
    : items.filter(item => item.category === category);

  if (filteredItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground" data-testid="text-no-content">
          No content found in this category
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="mb-4 hidden md:block">
        <div className="flex items-center gap-6 px-4 text-sm font-medium text-muted-foreground">
          <div className="w-24 flex-shrink-0">Thumbnail</div>
          <div className="flex-1 min-w-0 md:min-w-[200px]">Title</div>
          <div className="w-24 flex-shrink-0">Release Date</div>
          <div className="w-32 flex-shrink-0">Category</div>
          <div className="w-auto flex-shrink-0">Actions</div>
        </div>
      </div>
      <div className="space-y-3">
        {filteredItems.map((item, index) => (
          <ContentItem key={item._id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
