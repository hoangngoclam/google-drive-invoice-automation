/**
 * Creates a custom menu in the spreadsheet UI when the file is opened.
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('🚀 PDF Processor')
      .addItem('Process New PDFs', 'processPdfsInFolder')
      .addSeparator() 
      .addItem('Update file name', 'renameFilesFromSheet')
      .addToUi();
}

const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

/**
 * Main function to start the PDF processing workflow.
 * Uses services to find dynamic folders, process files, and log data.
 */
function processPdfsInFolder() {
  try {
    // 1. Initialize all services
    const driveService = new DriveService(Config.ROOT_FOLDER_ID);
    const geminiService = new GeminiService(Config.GEMINI_API_KEY, Config.GEMINI_API_URL);
    const sheetService = new SheetService(Config.SHEET_ID, Config.SHEET_NAME);

    // 2. Get the dynamic source and destination folders for the current month
    Logger.log("Finding current month's folders...");
    const { sourceFolder, destFolder } = driveService.getCurrentMonthFolders();
    Logger.log(`Source: ${sourceFolder.getName()}, Dest: ${destFolder.getName()}`);

    const files = sourceFolder.getFilesByType(MimeType.PDF);
    if (!files.hasNext()) {
      Logger.log('No PDF files found in the "source" folder for this month.');
      SpreadsheetApp.getUi().alert('No new PDFs found in the "source" folder.');
      return;
    }

    Logger.log('Found PDF files to process.');

    // 3. Process each file
    // Convert files iterator to array for counting
    const fileArr = [];
    while (files.hasNext()) {
      fileArr.push(files.next());
    }

    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      const fileName = file.getName();
      spreadsheet.toast(`Processing ${i + 1}/${fileArr.length} files, file name: "${fileName}"`);
      Logger.log(`Processing file: ${fileName}`);

      // 4. Extract data using GeminiService
      const extractedData = geminiService.extractInvoiceData(file);

      if (extractedData) {
        // 5. Move file and log data using DriveService and SheetService
        file.moveTo(destFolder);
        Logger.log(`Moved ${fileName} to destination folder.`);

        const newFileUrl = file.getUrl();
        sheetService.logData(extractedData, newFileUrl);

      } else {
        Logger.log(`Skipping file ${fileName} due to an error during AI processing.`);
      }
    }

    Logger.log('Finished processing all files.');
    SpreadsheetApp.getUi().alert('PDF processing complete.');

  } catch (e) {
    Logger.log(`Error in processPdfsInFolder: ${e.toString()}`);
    SpreadsheetApp.getUi().alert(e);
  }
}

/**
 * Renames files in Google Drive based on sheet data.
 * Filters for rows where B, Y are filled and Z is FALSE.
 * After success, sets Z to TRUE.
 */
function renameFilesFromSheet() {
  const ui = SpreadsheetApp.getUi();
  let processedCount = 0;
  
  try {
    // 1. Initialize services
    const sheetService = new SheetService(Config.SHEET_ID, Config.SHEET_NAME);

    // 2. Get all rows that need to be renamed
    const rowsToRename = sheetService.getRowsToRename();
    if (rowsToRename.length === 0) {
      ui.alert('No files to rename. (Check B, Y, and Z columns).');
      return;
    }

    Logger.log(`Found ${rowsToRename.length} file(s) to rename.`);

    // 3. Process each row
    for (let i = 0; i < rowsToRename.length; i++) {
      const row = rowsToRename[i];
      try {
        spreadsheet.toast(`Processing ${i + 1}/${rowsToRename.length} files, file name: "${row.noMonth}. VAT ${row.supplierVT} ${row.invoiceNo}"`);
        // Build the new name (uses Col M as per your last script)
        const newName = `${row.noMonth}. VAT ${row.supplierVT} ${row.invoiceNo}`;

        const fileId = DriveService.extractIdFromUrl(row.fileUrl);
        if (!fileId) {
          Logger.log(`Skipping row ${row.rowIndex}: Could not parse file ID from URL: ${row.fileUrl}`);
          continue;
        }

        // 4. Rename file
        const file = DriveApp.getFileById(fileId);
        file.setName(newName);

        // 5. Update sheet
        sheetService.updateProgress(row.rowIndex);

        Logger.log(`Renamed file for row ${row.rowIndex} to: ${newName}`);
        processedCount++;

      } catch (e) {
        Logger.log(`Error processing row ${row.rowIndex}: ${e.toString()}`);
      }
    }
    
    ui.alert(`Rename process finished. ${processedCount} file(s) were renamed.`);
    
  } catch (e) {
    Logger.log(`Error in renameFilesFromSheet: ${e.toString()}`);
    SpreadsheetApp.getUi().alert(e);
  }
}