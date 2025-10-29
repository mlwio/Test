import { useState } from 'react';
import { SearchDialog } from '../SearchDialog';
import { Button } from '@/components/ui/button';

export default function SearchDialogExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Search</Button>
      <SearchDialog 
        open={open}
        onOpenChange={setOpen}
        onSearch={(query, category) => console.log('Search:', query, category)}
      />
    </div>
  );
}
