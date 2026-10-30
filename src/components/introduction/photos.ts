// The photo fan from Figma (node 192:2678). All numbers are design pixels of the desktop frame.
// The fan scales as one piece (the phone design is the same fan at 45%), so PhotoFan turns
// every number into a percentage of the fan box.
export const FAN = { width: 865.373, height: 437.767, radius: 23 };

export type FanPhoto = {
  src: string;
  /** Center of the card, measured from the top-left of the fan. */
  x: number;
  y: number;
  /** Size of the card before it is rotated. */
  w: number;
  h: number;
  rotate: number;
  /** Where the photo is anchored when the card crops it (CSS object-position). */
  focus?: string;
};

// In painting order: a later card lies on top of the earlier ones.
export const FAN_PHOTOS: FanPhoto[] = [
  { src: "/photos/fan/left.jpg", x: 151.285, y: 243.164, w: 218.079, h: 343.087, rotate: -15.66 },
  { src: "/photos/fan/right.jpg", x: 714.07, y: 241.89, w: 218.086, h: 343.086, rotate: 15.66 },
  { src: "/photos/fan/mid-right.jpg", x: 583.471, y: 208.762, w: 242.206, h: 381.031, rotate: 6.3, focus: "8% 50%" },
  { src: "/photos/fan/mid-left.jpg", x: 285.915, y: 208.377, w: 241.755, h: 380.322, rotate: -6.3 },
  { src: "/photos/fan/center.jpg", x: 434.69, y: 196.756, w: 250.139, h: 393.511, rotate: 0 },
];
