import { createContext, useContext, useRef, type ReactNode, useCallback } from 'react';

interface SidebarContextType {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  scrollToActiveItem: (index: number) => void;
  scrollToItem: (element: HTMLElement) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToItem = useCallback((element: HTMLElement) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    
    // Calcula a posição para centralizar o item
    const scrollTop = element.offsetTop - (containerRect.height / 2) + (itemRect.height / 2);
    
    container.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: 'smooth'
    });
  }, []);

  const scrollToActiveItem = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const items = container.children;
    
    if (index >= 0 && index < items.length) {
      const targetItem = items[index] as HTMLElement;
      scrollToItem(targetItem);
    }
  }, [scrollToItem]);

  return (
    <SidebarContext.Provider value={{ scrollContainerRef, scrollToActiveItem, scrollToItem }}>
      {children}
    </SidebarContext.Provider>
  );
}; 