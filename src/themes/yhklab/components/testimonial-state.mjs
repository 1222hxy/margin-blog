export function createTestimonialState({ useEffect, useRef, useState }) {
  const clamp = (number, max) => Math.min(Math.max(number, 0), max);
  const rtl = (track) => (getComputedStyle(track).direction === "rtl" ? -1 : 1);

  return function useTestimonialState(total) {
    const track = useRef(null);
    const intended = useRef(null);
    const [active, setActive] = useState(0);
    const [progress, setProgress] = useState(0);
    const [split, setSplit] = useState(false);

    useEffect(() => {
      if (total !== 2) return;
      const query = matchMedia("(min-width: 48rem)");
      const change = () => {
        setSplit(query.matches);
        if (query.matches) {
          intended.current = null;
          setActive(0);
          setProgress(0);
        }
      };
      change();
      query.addEventListener("change", change);
      return () => query.removeEventListener("change", change);
    }, [total]);

    function select(index) {
      if (index < 0) return;
      const next = index % total;
      const element = track.current;
      setActive(next);
      if (!element?.clientWidth) {
        intended.current = null;
        setProgress(next);
        return;
      }
      intended.current = next;
      element.scrollTo({
        left: element.clientWidth * next * rtl(element),
        behavior: "smooth",
      });
    }

    function scroll({ currentTarget: element }) {
      const position = clamp(
        (element.scrollLeft * rtl(element)) / (element.clientWidth || 1),
        total - 1,
      );
      setProgress(position);
      if (intended.current !== null) {
        if (Math.abs(position - intended.current) < 0.01)
          intended.current = null;
        return;
      }
      setActive(Math.round(position));
    }

    const interrupt = () => {
      intended.current = null;
    };
    const size = Math.min(total, 4);
    const start = clamp(progress - 2, total - size);
    const activeStart = clamp(active - 2, total - size);
    const position = (progress - start + 0.5) / size;
    const paged = total > size;
    const tail = paged
      ? `calc(${100 * position}% + ${16 * (1 - 2 * position)}px)`
      : `${100 * position}%`;
    return {
      active,
      track,
      split,
      select,
      scroll,
      interrupt,
      tail,
      window: { size, start, activeStart, paged, progress },
    };
  };
}
