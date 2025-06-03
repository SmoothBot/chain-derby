import { useEffect, useLayoutEffect, useState } from "react";

export function useContainerSize(id: string) {
  const [size, setSize] = useState([0, 0]);
  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    const container = document.getElementById(id);
    function updateSize() {
      setSize([container?.offsetWidth ?? 0, container?.offsetHeight ?? 0]);
    }

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return size;
}
