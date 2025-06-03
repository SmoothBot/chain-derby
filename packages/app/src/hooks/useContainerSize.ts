import { useEffect, useLayoutEffect, useState } from "react";
import { useDebounce } from "@/lib/debounce";

export function useContainerSize(id: string) {
  const [size, setSize] = useState([0, 0]);
  const [isMounted, setIsMounted] = useState(false);

  const updateSize = () => {
    const container = document.getElementById(id);
    setSize([container?.offsetWidth ?? 0, container?.offsetHeight ?? 0]);
  };

  // Debounce the resize handler to avoid excessive state updates (16ms ≈ 60fps)
  const debouncedUpdateSize = useDebounce(updateSize, 16, [id]);

  useLayoutEffect(() => {
    // Update size immediately on mount
    updateSize();
    
    // Add debounced resize listener
    window.addEventListener("resize", debouncedUpdateSize);

    return () => window.removeEventListener("resize", debouncedUpdateSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, debouncedUpdateSize]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return size;
}
