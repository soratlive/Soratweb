
import { 
  Wind, 
  Umbrella, 
  Target, 
  Sun, 
  Flower2, 
  Lamp, 
  Bug, 
  Bird, 
  Footprints, 
  Cloud, 
  Database,
  Milk
} from 'lucide-react';

export const GAME_SLOTS = [
  { id: 1, name: 'पतंग', icon: Wind, color: 'text-blue-400' },
  { id: 2, name: 'छत्री', icon: Umbrella, color: 'text-pink-400' },
  { id: 3, name: 'बॉल', icon: Target, color: 'text-red-400' },
  { id: 4, name: 'सूर्य', icon: Sun, color: 'text-yellow-400' },
  { id: 5, name: 'फूल', icon: Flower2, color: 'text-rose-400' },
  { id: 6, name: 'दिवा', icon: Lamp, color: 'text-orange-400' },
  { id: 7, name: 'फुलपाखरू', icon: Bug, color: 'text-purple-400' },
  { id: 8, name: 'चिमणी', icon: Bird, color: 'text-sky-400' },
  { id: 9, name: 'ससा', icon: Footprints, color: 'text-gray-300' },
  { id: 10, name: 'बकरी', icon: Cloud, color: 'text-white' },
  { id: 11, name: 'माठ', icon: Database, color: 'text-amber-600' },
  { id: 12, name: 'गाय', icon: Milk, color: 'text-green-200' },
];

export const INITIAL_BALANCE = 5000;
export const MULTIPLIER = 10;
export const CYCLE_DURATION = 30; // seconds
export const LOCK_DURATION = 5; // last 5 seconds
