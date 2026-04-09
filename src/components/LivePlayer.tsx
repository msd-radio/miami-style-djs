import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Radio } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const STREAM_URL = "https://radio.miamistyledjs.com/listen/miami_style_djs_/radio.mp3";

const LivePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.src = STREAM_URL;
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (val: number[]) => {
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val[0] / 100;
    }
    if (val[0] === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  return (
    <>
      <audio ref={audioRef} preload="none" />

      {/* Fixed bottom bar */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-16 gap-4">
          {/* Left: status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-fire flex items-center justify-center">
                <Radio className="w-5 h-5 text-primary-foreground" />
              </div>
              <AnimatePresence>
                {isPlaying && (
                  <motion.span
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-primary/40"
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-heading font-bold text-foreground truncate">
                Miami Style DJ's Radio
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPlaying ? "bg-primary animate-pulse" : "bg-muted-foreground"
                  }`}
                />
                {isPlaying ? "LIVE NOW" : "PRESS PLAY"}
              </p>
            </div>
          </div>

          {/* Center: play button */}
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-fire flex items-center justify-center shadow-fire hover:scale-110 transition-transform"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            )}
          </button>

          {/* Right: volume */}
          <div className="hidden sm:flex items-center gap-2 w-36 mr-[12rem]">
            <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
              {isMuted || volume[0] === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <Slider
              value={isMuted ? [0] : volume}
              onValueChange={handleVolume}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default LivePlayer;
