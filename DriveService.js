class DriveService {
  /**
   * @param {string} rootFolderId The ID of the root folder.
   */
  constructor(rootFolderId) {
    if (!rootFolderId) {
      throw new Error("ROOT_FOLDER_ID is not set in Script Properties.");
    }
    try {
      this.rootFolder = DriveApp.getFolderById(rootFolderId);
    } catch (e) {
      throw new Error(`Could not access ROOT_FOLDER_ID: ${rootFolderId}. Check ID and permissions.`);
    }
  }

  /**
   * Finds the source and destination folders for the current month.
   * @return {{sourceFolder: GoogleAppsScript.Drive.Folder, destFolder: GoogleAppsScript.Drive.Folder}}
   */
  getCurrentMonthFolders() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 01, 02... 10, 11

    const yearFolderName = `${year}${Config.YEAR_FOLDER_SUFFIX}`;
    const monthFolderName = `${year}.${month}${Config.MONTH_FOLDER_SUFFIX}`;

    // Find nested folders
    const yearFolder = this._getFolderByName(this.rootFolder, yearFolderName);
    const monthFolder = this._getFolderByName(yearFolder, monthFolderName);
    
    const sourceFolder = this._getFolderByName(monthFolder, Config.SOURCE_FOLDER_NAME);
    const destFolder = this._getFolderByName(monthFolder, Config.DEST_FOLDER_NAME);

    return { sourceFolder, destFolder };
  }

  /**
   * Helper to find a subfolder by name. Throws an error if not found.
   * @param {GoogleAppsScript.Drive.Folder} parentFolder The folder to search in.
   * @param {string} name The name of the folder to find.
   * @return {GoogleAppsScript.Drive.Folder} The found folder.
   * @private
   */
  _getFolderByName(parentFolder, name) {
    const folders = parentFolder.getFoldersByName(name);
    if (!folders.hasNext()) {
      throw new Error(`Folder not found: "${name}" inside "${parentFolder.getName()}"`);
    }
    const folder = folders.next();
    if (folders.hasNext()) {
      Logger.log(`Warning: Multiple folders named "${name}" found in "${parentFolder.getName()}". Using the first one.`);
    }
    return folder;
  }

  /**
   * Helper function to extract Google Drive file ID from its URL.
   * @param {string} url The Google Drive file URL.
   * @return {string|null} The- extracted file ID or null if not found.
   */
  static extractIdFromUrl(url) {
    if (typeof url !== 'string' || !url) {
      return null;
    }
    const match = url.match(/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  }
}