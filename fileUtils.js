const fs = require('fs');
const path = require('path');

class FileUtils {
  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  saveToJson(dirPath, filename, data) {
    try {
      this.ensureDir(dirPath);
      const filePath = path.join(dirPath, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✓ Saved: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`✗ Error saving ${filename}:`, error.message);
      return false;
    }
  }

  loadFromJson(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error(`Error loading ${filePath}:`, error.message);
      return null;
    }
  }

  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  mergeAndSaveJson(dirPath, filename, newData) {
    try {
      this.ensureDir(dirPath);
      const filePath = path.join(dirPath, filename);
      const existingData = this.loadFromJson(filePath) || [];

      // Merge arrays and remove duplicates
      const mergedData = [...new Set([...existingData, ...newData])];

      fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2), 'utf8');
      console.log(`✓ Merged and saved: ${filePath} (${existingData.length} old + ${newData.length} new = ${mergedData.length} total)`);
      return true;
    } catch (error) {
      console.error(`✗ Error merging ${filename}:`, error.message);
      return false;
    }
  }
}

module.exports = new FileUtils();
