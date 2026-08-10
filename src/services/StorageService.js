import { mkdir, unlink, writeFile } from 'node:fs/promises';
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

  async deletePdf(publicPath) {
    if (!publicPath?.startsWith('/files/')) {
      return;
    }

    const storageRoot = path.resolve(process.cwd(), 'storage');
    const relativePath = publicPath.slice('/files/'.length);
    const filePath = path.resolve(storageRoot, relativePath);

    if (!filePath.startsWith(`${storageRoot}${path.sep}`)) {
      return;
    }

    try {
      await unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Não foi possível remover o PDF do pedido: ${error.message}`);
      }
    }
  }
}

export default new StorageService();
