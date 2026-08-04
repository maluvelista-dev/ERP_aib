import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

class StorageService {
  async uploadPdf(buffer, destination) {
    const normalizedDestination = destination.replace(/\\/g, '/');
    const storageRoot = path.resolve(process.cwd(), 'storage');
    const filePath = path.join(storageRoot, normalizedDestination);
    const publicPath = `/files/${normalizedDestination}`;

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);

    return publicPath;
  }
}

export default new StorageService();
