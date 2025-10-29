import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ContentList } from "@/components/ContentList";
import { SearchDialog } from "@/components/SearchDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { EditDialog } from "@/components/EditDialog";
import type { ContentItem } from "@shared/schema";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All Type");
  const [searchOpen, setSearchOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("Movie");

  const { data: allContent = [], isLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content"],
  });

  const filteredItems = allContent.filter(item => {
    const matchesCategory = selectedCategory === "All Type" || selectedCategory === item.category;
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearchCategory = searchQuery === "" || searchCategory === item.category;
    
    return matchesCategory && (!searchQuery || (matchesSearch && matchesSearchCategory));
  });

  const handleSearch = (query: string, category: string) => {
    setSearchQuery(query);
    setSearchCategory(category);
    if (query) {
      setSelectedCategory(category);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        actionLabel="Upload" 
        onActionClick={() => setLocation("/upload")} 
      />
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSearchClick={() => setSearchOpen(true)}
        onDeleteClick={() => setDeleteOpen(true)}
        onEditClick={() => setEditOpen(true)}
      />
      <main className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        ) : (
          <ContentList items={filteredItems} category={selectedCategory} />
        )}
      </main>
      <Footer />
      <SearchDialog 
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSearch={handleSearch}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        items={allContent}
      />
      <EditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        items={allContent}
      />
    </div>
  );
}
