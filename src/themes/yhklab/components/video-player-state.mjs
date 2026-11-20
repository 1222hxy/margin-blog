export function createVideoState({ useEffect, useRef, useState }) {
  return function useVideoState({ autoplay, disabled }) {
    const media = useRef(null),
      frame = useRef(null),
      timeout = useRef(null);
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [started, setStarted] = useState(false);
    const [poster, setPoster] = useState(true);
    const [visible, setVisible] = useState(true);
    const [muted, setMuted] = useState(!!autoplay);
    const [duration, setDuration] = useState(0);
    const [current, setCurrent] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [fullscreen, setFullscreen] = useState(false);
    const pausedByUser = useRef(false);

    function play() {
      return media.current?.play().catch(() => {});
    }
    function stopTimer() {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    function reveal({ expire = true } = {}) {
      stopTimer();
      setVisible(true);
      if (expire) timeout.current = setTimeout(() => setVisible(false), 2500);
    }
    useEffect(() => {
      setReady(true);
      const video = media.current;
      if (video) {
        setDuration(Number.isFinite(video.duration) ? video.duration : 0);
        setMuted(video.muted);
        if (!video.paused) {
          setStarted(true);
          setPoster(false);
          setPlaying(true);
        }
      }
      const update = () =>
        setFullscreen(document.fullscreenElement === frame.current);
      document.addEventListener("fullscreenchange", update);
      return () => {
        document.removeEventListener("fullscreenchange", update);
        stopTimer();
      };
    }, []);
    useEffect(() => {
      const video = media.current;
      if (!video) return;
      if (disabled) {
        video.pause();
        return;
      }
      if (typeof IntersectionObserver === "undefined") {
        if (autoplay && !pausedByUser.current) void play();
        return;
      }
      const motion = matchMedia("(prefers-reduced-motion: reduce)");
      let inView = false;
      const update = () => {
        if (!inView || (autoplay && motion.matches)) video.pause();
        else if (autoplay && !pausedByUser.current) void play();
      };
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        update();
      });
      observer.observe(video);
      motion.addEventListener("change", update);
      return () => {
        observer.disconnect();
        motion.removeEventListener("change", update);
      };
    }, [autoplay, disabled]);

    const seek = (time) => {
      const video = media.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0)
        return;
      video.currentTime = Math.max(0, Math.min(video.duration, time));
      setCurrent(video.currentTime);
    };
    const metadata = ({ currentTarget: video }) =>
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    return {
      media,
      frame,
      ready,
      playing,
      started,
      poster,
      visible,
      muted,
      duration,
      current,
      speed,
      fullscreen,
      seek,
      video: {
        onLoadedMetadata: metadata,
        onDurationChange: metadata,
        onTimeUpdate: ({ currentTarget: video }) =>
          setCurrent(video.currentTime),
        onPlaying() {
          setStarted(true);
          setPlaying(true);
          setPoster(false);
          reveal();
        },
        onPause() {
          setPlaying(false);
        },
        onEnded() {
          setPlaying(false);
          pausedByUser.current = true;
        },
        onVolumeChange: ({ currentTarget: video }) => setMuted(video.muted),
        onRateChange: ({ currentTarget: video }) =>
          setSpeed(video.playbackRate),
      },
      toggle() {
        const video = media.current;
        if (!video || disabled) return;
        pausedByUser.current = !video.paused;
        if (video.paused) void play();
        else video.pause();
      },
      toggleMute() {
        if (media.current) media.current.muted = !media.current.muted;
      },
      setRate(rate) {
        if (media.current) media.current.playbackRate = rate;
      },
      toggleFullscreen() {
        if (fullscreen) void document.exitFullscreen?.().catch(() => {});
        else void frame.current?.requestFullscreen?.().catch(() => {});
      },
      onMouseMove: () => {
        if (started) reveal();
      },
      onMouseLeave: () => {
        if (started) {
          stopTimer();
          setVisible(false);
        }
      },
      onKeyDown: (event) => {
        stopTimer();
        setVisible(event.key !== "Escape");
      },
    };
  };
}
