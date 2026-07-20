// Game images configuration
// Replace these with your actual image paths in /public/images/
export const GAME_IMAGES = [
  '/images/sample-1.svg',
  '/images/sample-2.svg',
  '/images/sample-3.svg',
  '/images/sample-4.svg',
  '/images/sample-5.svg',
];

export function getRandomImage(): string {
  return GAME_IMAGES[Math.floor(Math.random() * GAME_IMAGES.length)];
}
