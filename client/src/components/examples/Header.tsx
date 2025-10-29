import { Header } from '../Header';

export default function HeaderExample() {
  return (
    <Header 
      actionLabel="Upload" 
      onActionClick={() => console.log('Action clicked')} 
    />
  );
}
