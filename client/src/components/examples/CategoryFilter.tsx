import { useState } from 'react';
import { CategoryFilter } from '../CategoryFilter';

export default function CategoryFilterExample() {
  const [category, setCategory] = useState('Movie');
  
  return (
    <CategoryFilter 
      selectedCategory={category}
      onCategoryChange={setCategory}
      onSearchClick={() => console.log('Search clicked')}
    />
  );
}
