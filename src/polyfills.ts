import { Buffer } from 'buffer';

// Explicitly expose Buffer globally for libraries that expect it
(window as any).Buffer = Buffer;
