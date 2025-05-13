import * as React from "react";

interface PopoverProps {
  children: React.ReactNode;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "center" | "start" | "end";
}

type ElementWithOnClick = React.ReactElement & {
  props: { onClick?: (e: React.MouseEvent) => void }
};

export function Popover({ children }: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  
  return (
    <PopoverContext.Provider value={{ isOpen, toggleOpen, setIsOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

type PopoverContextType = {
  isOpen: boolean;
  toggleOpen: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

function usePopover() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within a Popover");
  }
  return context;
}

export function PopoverTrigger({ children, asChild = false }: PopoverTriggerProps) {
  const { toggleOpen } = usePopover();
  
  if (asChild && React.isValidElement(children)) {
    // Type assertion to handle props correctly
    const childElement = children as ElementWithOnClick;
    
    return React.cloneElement(childElement, {
      onClick: (e: React.MouseEvent) => {
        toggleOpen();
        if (childElement.props.onClick) {
          childElement.props.onClick(e);
        }
      },
    });
  }
  
  return (
    <button onClick={toggleOpen} type="button">
      {children}
    </button>
  );
}

export function PopoverContent({ 
  children, 
  className = "", 
  align = "center" 
}: PopoverContentProps) {
  const { isOpen, setIsOpen } = usePopover();
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  
  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);
  
  if (!isOpen) return null;
  
  const alignClass = 
    align === "start" ? "left-0" : 
    align === "end" ? "right-0" : 
    "left-1/2 transform -translate-x-1/2";
  
  return (
    <div 
      ref={contentRef}
      className={`absolute z-50 mt-1 ${alignClass} bg-white rounded-md shadow-lg border border-slate-200 ${className}`} 
    >
      {children}
    </div>
  );
} 