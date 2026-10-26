/** Instagram-format clips (9:16). Drop files in public/videos/reels and list them here. */
export type Reel = {
  src: string;
  poster: string;
};

export const reels: Reel[] = [
  { src: "/videos/reels/reel-01.mp4", poster: "/videos/reels/reel-01.webp" },
  { src: "/videos/reels/reel-02.mp4", poster: "/videos/reels/reel-02.webp" },
  { src: "/videos/reels/reel-03.mp4", poster: "/videos/reels/reel-03.webp" },
  { src: "/videos/reels/reel-04.mp4", poster: "/videos/reels/reel-04.webp" },
  { src: "/videos/reels/reel-05.mp4", poster: "/videos/reels/reel-05.webp" },
  { src: "/videos/reels/reel-06.mp4", poster: "/videos/reels/reel-06.webp" },
];
