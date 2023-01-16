import { promises as fs } from 'node:fs';

const writeFile = async (path: string, data: string): Promise<void> => {
  await fs.writeFile(path, data);
};

export { writeFile };
