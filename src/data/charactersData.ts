import { Character } from '../types';
import { Fruigle } from './characters/Fruigle';
import { Glimmbear } from './characters/Glimmbear';
import { Tigravine } from './characters/Tigravine';

export const characters: Record<string, Character> = {
  Glimmbear,
  Fruigle,
  Tigravine
};
