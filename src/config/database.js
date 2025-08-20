class MemoryDatabase {
  constructor() {
    this.storage = new Map();
    this.fileMetadata = new Map();
  }

  // Store PDF content
  storePDF(fileId, content, metadata = {}) {
    this.storage.set(fileId, content);
    this.fileMetadata.set(fileId, {
      ...metadata,
      createdAt: new Date(),
      lastAccessed: new Date(),
    });
    return true;
  }

  // Retrieve PDF content
  getPDF(fileId) {
    const content = this.storage.get(fileId);
    if (content) {
      // Update last accessed time
      const metadata = this.fileMetadata.get(fileId);
      if (metadata) {
        metadata.lastAccessed = new Date();
        this.fileMetadata.set(fileId, metadata);
      }
    }
    return content;
  }

  // Get file metadata
  getFileMetadata(fileId) {
    return this.fileMetadata.get(fileId);
  }

  // Check if file exists
  hasFile(fileId) {
    return this.storage.has(fileId);
  }

  // Remove file
  removeFile(fileId) {
    this.storage.delete(fileId);
    this.fileMetadata.delete(fileId);
    return true;
  }

  // Get all files (for admin purposes)
  getAllFiles() {
    const files = [];
    for (const [fileId, metadata] of this.fileMetadata) {
      files.push({
        fileId,
        ...metadata,
        hasContent: this.storage.has(fileId),
      });
    }
    return files;
  }

  // Clean up old files (older than 24 hours)
  cleanup() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const [fileId, metadata] of this.fileMetadata) {
      if (metadata.createdAt < oneDayAgo) {
        this.removeFile(fileId);
      }
    }
  }

  // Get storage stats
  getStats() {
    return {
      totalFiles: this.storage.size,
      totalMetadata: this.fileMetadata.size,
    };
  }
}

// Create singleton instance
const memoryDB = new MemoryDatabase();

// Cleanup old files every hour
setInterval(() => {
  memoryDB.cleanup();
}, 60 * 60 * 1000);

module.exports = memoryDB;
