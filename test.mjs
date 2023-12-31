import { dirname } from 'path';
import { fileURLToPath } from 'url';

console.log(dirname(fileURLToPath(import.meta.url)));
