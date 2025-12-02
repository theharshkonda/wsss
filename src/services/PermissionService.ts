import {Platform, PermissionsAndroid} from 'react-native';

export class PermissionService {
  static async requestStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    const apiLevel = Platform.Version;

    try {
      if (apiLevel >= 33) {
        // Android 13+
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        );
      } else if (apiLevel >= 23) {
        // Android 6+
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        if (apiLevel < 30) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
        }
      }

      return true;
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  }

  static async checkAndRequestPermissions(): Promise<boolean> {
    return await this.requestStoragePermission();
  }
}
