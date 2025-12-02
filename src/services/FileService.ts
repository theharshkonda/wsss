import RNFS from 'react-native-fs';
import {MediaItem} from '../types';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {openDocumentTree, listFiles, readFile} from 'react-native-saf-x';

const SAF_URI_KEY = '@whatsapp_status_saf_uri';

export class FileService {
  private static readonly CACHE_DIR = `${RNFS.CachesDirectoryPath}/statuses`;

  private static readonly WHATSAPP_STATUS_PATHS = [
    // Normal WhatsApp
    '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/Statuses',
    '/storage/emulated/0/WhatsApp/Media/.Statuses',

    // WhatsApp Business
    '/storage/emulated/0/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/.Statuses',
    '/storage/emulated/0/WhatsApp Business/Media/.Statuses',

    // WhatsApp Clones
    '/storage/emulated/0/Android/media/com.whatsapp2/WhatsApp/Media/.Statuses',
    '/storage/emulated/0/Android/media/com.whatsapp.clone/WhatsApp/Media/.Statuses',
  ];

  private static readonly SAVE_PATH = `${RNFS.PicturesDirectoryPath}/StatusBox`;

  static async ensureSaveDirectory(): Promise<void> {
    const exists = await RNFS.exists(this.SAVE_PATH);
    if (!exists) {
      await RNFS.mkdir(this.SAVE_PATH);
    }
  }

  /**
   * Attempt raw direct file access scan
   */
  private static async rawScan(): Promise<MediaItem[]> {
    const allMedia: MediaItem[] = [];

    for (const path of this.WHATSAPP_STATUS_PATHS) {
      try {
        const exists = await RNFS.exists(path);
        if (!exists) continue;

        const files = await RNFS.readDir(path);

        for (const file of files) {
          if (file.isFile()) {
            const extension = file.name.toLowerCase().split('.').pop() || '';
            const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            const videoExt = ['mp4', '3gp', 'mkv', 'avi', 'mov'];

            let type: 'image' | 'video' | null = null;

            if (imageExt.includes(extension)) {
              type = 'image';
            } else if (videoExt.includes(extension)) {
              type = 'video';
            }

            if (type) {
              const fileUri = Platform.OS === 'android' ? `file://${file.path}` : file.path;
              allMedia.push({
                id: `raw_${file.name}_${file.mtime}`,
                uri: fileUri,
                displayUri: fileUri, // For raw files, displayUri is same as uri
                name: file.name,
                type,
                size: file.size,
                timestamp: new Date(file.mtime || Date.now()).getTime(),
                isVideo: type === 'video',
                mtime: new Date(file.mtime || Date.now()).getTime(),
                source: 'raw',
              });
            }
          }
        }
      } catch (error) {
        // Path not accessible, continue to next
        continue;
      }
    }

    return allMedia;
  }

  /**
   * Get saved SAF URI from storage
   */
  static async getSavedSafUri(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(SAF_URI_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Save SAF URI to storage
   */
  static async saveSafUri(uri: string): Promise<void> {
    try {
      await AsyncStorage.setItem(SAF_URI_KEY, uri);
    } catch (error) {
      console.error('Error saving SAF URI:', error);
    }
  }

  /**
   * Clear saved SAF URI
   */
  static async clearSafUri(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SAF_URI_KEY);
    } catch (error) {
      console.error('Error clearing SAF URI:', error);
    }
  }

  /**
   * Open SAF folder picker
   */
  static async openSafPicker(): Promise<string | null> {
    try {
      const result = await openDocumentTree(true);
      if (result && result.uri) {
        await this.saveSafUri(result.uri);
        return result.uri;
      }
      return null;
    } catch (error) {
      console.error('SAF picker error:', error);
      return null;
    }
  }

  /**
   * Recursively find .Statuses folder within a WhatsApp directory
   */
  private static async findStatusesFolder(uri: string, depth: number = 0): Promise<string | null> {
    if (depth > 5) return null; // Prevent infinite recursion

    try {
      const items = await listFiles(uri);

      for (const item of items) {
        if (item.type === 'directory') {
          // Check if this is the .Statuses folder
          if (item.name === '.Statuses' || item.name === 'Statuses') {
            console.log('Found .Statuses folder:', item.uri);
            return item.uri;
          }

          // Recursively search in WhatsApp-related subdirectories
          if (item.name === 'WhatsApp' || item.name === 'Media') {
            const result = await this.findStatusesFolder(item.uri, depth + 1);
            if (result) return result;
          }
        }
      }
    } catch (error) {
      console.error('Error searching for .Statuses folder:', error);
    }

    return null;
  }

  /**
   * Ensure cache directory exists
   */
  private static async ensureCacheDirectory(): Promise<void> {
    const exists = await RNFS.exists(this.CACHE_DIR);
    if (!exists) {
      await RNFS.mkdir(this.CACHE_DIR);
    }
  }

  /**
   * Copy SAF file to cache and return file:// URI
   */
  private static async copySafFileToCache(safUri: string, fileName: string): Promise<string> {
    await this.ensureCacheDirectory();

    const cachePath = `${this.CACHE_DIR}/${fileName}`;

    // Check if already cached
    const exists = await RNFS.exists(cachePath);
    if (exists) {
      return `file://${cachePath}`;
    }

    try {
      // Read file content via SAF as base64
      const base64Content = await readFile(safUri, {encoding: 'base64'});

      // Write to cache
      await RNFS.writeFile(cachePath, base64Content, 'base64');

      return `file://${cachePath}`;
    } catch (error) {
      console.error('Error caching SAF file:', fileName, error);
      // Return original URI as fallback
      return safUri;
    }
  }

  /**
   * Scan files from SAF URI
   */
  private static async safScan(uri: string): Promise<MediaItem[]> {
    const allMedia: MediaItem[] = [];

    try {
      let scanUri = uri;

      // Check if the selected URI is a parent directory (contains com.whatsapp)
      const files = await listFiles(uri);
      console.log(`SAF Scan: Found ${files.length} items in folder`);

      // If we only see directories and no media files, try to find .Statuses folder
      const hasMediaFiles = files.some(f => {
        if (f.type !== 'file' || !f.name) return false;
        const ext = f.name.toLowerCase().split('.').pop() || '';
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', '3gp', 'mkv', 'avi', 'mov'].includes(ext);
      });

      if (!hasMediaFiles) {
        console.log('No media files found, searching for .Statuses folder...');

        // Look for com.whatsapp directory
        const whatsappDir = files.find(f => f.type === 'directory' && f.name === 'com.whatsapp');
        if (whatsappDir) {
          console.log('Found com.whatsapp directory, searching within it...');
          const statusesUri = await this.findStatusesFolder(whatsappDir.uri);
          if (statusesUri) {
            scanUri = statusesUri;
            console.log('Using .Statuses folder URI:', statusesUri);
          }
        }
      }

      // Now scan the correct folder for media files
      const mediaFiles = await listFiles(scanUri);
      console.log(`Scanning ${mediaFiles.length} items for media files`);

      for (const file of mediaFiles) {
        if (file.type === 'file' && file.name) {
          const extension = file.name.toLowerCase().split('.').pop() || '';
          const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
          const videoExt = ['mp4', '3gp', 'mkv', 'avi', 'mov'];

          let type: 'image' | 'video' | null = null;

          if (imageExt.includes(extension)) {
            type = 'image';
          } else if (videoExt.includes(extension)) {
            type = 'video';
          }

          if (type && file.uri) {
            console.log('Copying media file to cache:', file.name);

            // Copy SAF file to cache and get file:// URI for display
            const displayUri = await this.copySafFileToCache(file.uri, file.name);

            allMedia.push({
              id: `saf_${file.name}_${file.lastModified}`,
              uri: file.uri, // Original SAF URI for saving
              displayUri: displayUri, // Cached file:// URI for display
              name: file.name,
              type,
              size: file.size || 0,
              timestamp: file.lastModified || Date.now(),
              isVideo: type === 'video',
              mtime: file.lastModified || Date.now(),
              source: 'saf',
            });
          }
        }
      }

      console.log(`SAF Scan: Added ${allMedia.length} media items`);
    } catch (error) {
      console.error('SAF scan error:', error);
    }

    return allMedia;
  }

  /**
   * Main scan function: raw first, then SAF fallback
   */
  static async scanStatuses(): Promise<MediaItem[]> {
    // Step 1: Try raw scan
    const rawMedia = await this.rawScan();

    if (rawMedia.length > 0) {
      return rawMedia.sort((a, b) => (b.mtime || 0) - (a.mtime || 0));
    }

    // Step 2: Try SAF if URI exists
    const savedUri = await this.getSavedSafUri();

    if (savedUri) {
      const safMedia = await this.safScan(savedUri);
      if (safMedia.length > 0) {
        return safMedia.sort((a, b) => (b.mtime || 0) - (a.mtime || 0));
      }
    }

    // Step 3: Return empty (UI will show popup)
    return [];
  }

  /**
   * Trigger SAF picker and scan
   */
  static async triggerSafPickerAndScan(): Promise<MediaItem[]> {
    const uri = await this.openSafPicker();
    if (!uri) return [];

    const media = await this.safScan(uri);
    return media.sort((a, b) => (b.mtime || 0) - (a.mtime || 0));
  }

  static async getSavedMedia(): Promise<MediaItem[]> {
    try {
      await this.ensureSaveDirectory();

      const exists = await RNFS.exists(this.SAVE_PATH);
      if (!exists) return [];

      const files = await RNFS.readDir(this.SAVE_PATH);
      const media: MediaItem[] = [];

      for (const file of files) {
        if (file.isFile()) {
          const extension = file.name.toLowerCase().split('.').pop() || '';
          const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
          const videoExt = ['mp4', '3gp', 'mkv', 'avi', 'mov'];

          let type: 'image' | 'video' | null = null;

          if (imageExt.includes(extension)) {
            type = 'image';
          } else if (videoExt.includes(extension)) {
            type = 'video';
          }

          if (type) {
            const fileUri = Platform.OS === 'android' ? `file://${file.path}` : file.path;
            media.push({
              id: `saved_${file.name}_${file.mtime}`,
              uri: fileUri,
              displayUri: fileUri,
              name: file.name,
              type,
              size: file.size,
              timestamp: new Date(file.mtime || Date.now()).getTime(),
              isVideo: type === 'video',
              mtime: new Date(file.mtime || Date.now()).getTime(),
              source: 'raw',
            });
          }
        }
      }

      return media.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  static async saveMedia(item: MediaItem): Promise<void> {
    await this.ensureSaveDirectory();

    const timestamp = Date.now();
    const extension = item.name.split('.').pop() || 'jpg';
    const newFileName = `StatusBox_${timestamp}.${extension}`;
    const destinationPath = `${this.SAVE_PATH}/${newFileName}`;

    try {
      if (item.source === 'saf' && item.uri.startsWith('content://')) {
        // For SAF URIs, read via SAF and write via RNFS
        // Read the file content as base64
        const base64Content = await readFile(item.uri, {encoding: 'base64'});

        // Write to destination
        await RNFS.writeFile(destinationPath, base64Content, 'base64');

        console.log('SAF file saved successfully:', destinationPath);
      } else {
        // For raw file paths
        let sourcePath = item.uri;
        if (sourcePath.startsWith('file://')) {
          sourcePath = sourcePath.replace('file://', '');
        }
        await RNFS.copyFile(sourcePath, destinationPath);
        console.log('Raw file copied successfully:', destinationPath);
      }
    } catch (error) {
      console.error('Save media error:', error);
      throw new Error('Failed to save media file');
    }
  }

  static async deleteMedia(uri: string): Promise<void> {
    const path = uri.replace('file://', '');
    await RNFS.unlink(path);
  }
}
