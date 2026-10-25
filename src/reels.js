// The "film reels" of our Bioscope. Each frame is a scene rendered in ASCII.
export const reels = {
  "taj-mahal": {
    title: "Wonders of Distant Cities: The Taj Mahal",
    frames: [
`        .
       /_\\
   _  /___\\  _
  |_|_|_|_|_|_|
  ~~~~~~~~~~~~~   Dawn over Agra`,
`        ,
       /|\\
   _  /_|_\\  _
  |_|_|___|_|_|
  ~~~~~~~~~~~~~   Noon: marble glows`,
`     *   .   *
       /_\\
   _  /___\\  _
  |_|_|_|_|_|_|
  ~~~~~~~~~~~~~   Dusk: the moon rises`,
    ],
  },
  "mela-night": {
    title: "A Night at the Mela",
    frames: [
`   \\o/   \\o/
    |     |
   / \\   / \\     Crowd gathers`,
`    ___________
   |  O  O  O  |
   |___________|  The giant wheel turns`,
`   *  .  *  .  *
  . * FIREWORKS * .
   *  .  *  .  *   The finale!`,
    ],
  },
};

export const catalog = Object.entries(reels).map(([id, r]) => ({
  id,
  title: r.title,
  frames: r.frames.length,
}));
