import { useEffect, useState } from 'react';

const useResizeObserver = (
  containerRef,
  initialSize = { height: 0, width: 0 }
) => {
  const [size, setSize] = useState(initialSize);

  useEffect(() => {
    const containerElem = containerRef.current;

    if (!containerElem) {
      return;
    }

    const observer = new ResizeObserver(() => {
      setSize({
        height: containerElem.clientHeight,
        width: containerElem.clientWidth,
      });
    });

    observer.observe(containerElem);

    return () => observer.unobserve(containerElem);
  }, [containerRef]);

  return size;
};

export default useResizeObserver;
