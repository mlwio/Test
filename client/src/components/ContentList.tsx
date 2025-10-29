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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredItems.map((item) => (
          <ContentItem key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}
