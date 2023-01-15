import path from 'node:path';

const getFullUrl = (...urls: string[]): string => path.join(...urls);

export { getFullUrl };
