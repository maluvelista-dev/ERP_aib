import { mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

class StorageService {
  resolvePdfPath(publicPath) {
    if (!publicPath?.startsWith('/files/')) {
      return null;
    }

    const storageRoot = path.resolve(process.cwd(), 'storage');
    const relativePath = publicPath.slice('/files/'.length);
    const filePath = path.resolve(storageRoot, relativePath);

    return filePath.startsWith(`${storageRoot}${path.sep}`) ? filePath : null;
  }

  async uploadPdf(buffer, destination) {
    const normalizedDestination = destination.replace(/\\/g, '/');
    const storageRoot = path.resolve(process.cwd(), 'storage');
    const filePath = path.join(storageRoot, normalizedDestination);
    const publicPath = `/files/${normalizedDestination}`;

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);

    return publicPath;
  }

  async pdfExists(publicPath) {
    const filePath = this.resolvePdfPath(publicPath);
    if (!filePath) return false;

    try {
      const file = await stat(filePath);
      return file.isFile() && file.size > 0;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }

  async deletePdf(publicPath) {
    const filePath = this.resolvePdfPath(publicPath);

    if (!filePath) {
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
