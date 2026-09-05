'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, X } from 'lucide-react';

const VIDEOS = [
  { id: 'v1', title: 'Bosch Condens 2400i — Unboxing & First Look', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'v2', title: 'PPR Pipe Soldering — Step by Step', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'v3', title: 'Wall-Hung Boiler Installation Guide', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'v4', title: 'Choosing the Right Circulation Pump', youtubeId: 'dQw4w9WgXcQ' },
];

export default function VideoGallery() {
  const [active, setActive] = useState(null);

  return (
    <section id="video-reviews">
      <h2 className="text-2xl font-bold text-charcoal mb-5">Video Reviews &amp; Installation Tutorials</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {VIDEOS.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setActive(video)}
            className="group relative aspect-video rounded-2xl bg-charcoal overflow-hidden text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle size={40} className="text-white/90 group-hover:scale-110 transition-transform" />
            </div>
            <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold leading-snug">
              {video.title}
            </p>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Close video"
              className="absolute inset-0 bg-black/80"
              onClick={() => setActive(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white"
                aria-label="Close"
              >
                <X size={22} />
              </button>
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
