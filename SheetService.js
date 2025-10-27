class SheetService {
  /**
   * @param {string} sheetId
   * @param {string} sheetName
   */
  constructor(sheetId, sheetName) {
    if (!sheetId) {
      throw new Error("SHEET_ID is not set in Script Properties.");
    }
    try {
      const spreadsheet = SpreadsheetApp.openById(sheetId);
      this.sheet = spreadsheet.getSheetByName(sheetName);
      if (!this.sheet) {
        throw new Error(`Sheet not found: "${sheetName}". Please check Config.gs.`);
      }
    } catch (e) {
      throw new Error(`Could not open spreadsheet with ID: ${sheetId}. ${e.message}`);
    }
  }

  /**
   * --- HELPER METHOD ---
   * Converts a single column letter (A-Z) to a 0-based index.
   * e.g., "A" -> 0, "H" -> 7, "Z" -> 25
   * @param {string} letter The column letter.
   * @return {number} The 0-based index.
   * @private
   */
  _col(letter) {
    return letter.toUpperCase().charCodeAt(0) - 65;
  }

  /**
   * Appends a new row to the sheet with extracted data, link, and checkbox.
   * This version finds the first truly empty row and writes data cell-by-cell
   * to avoid overwriting formulas.
   * @param {Object} data The structured data object returned by the AI.
   * @param {string} fileUrl The Google Drive URL of the file.
   */
  logData(data, fileUrl) {
    try {
      // --- START: Find first empty row (your logic) ---
      // We check column J (Invoice No) to find the first empty row.
      const colJValues = this.sheet.getRange(1, this._col('J') + 1, this.sheet.getMaxRows()).getValues();
      
      // Find the first empty row in column J
      const emptyRowIdx = colJValues.findIndex(row => row[0] === "");
      const firstEmptyRow = emptyRowIdx === -1 ? colJValues.length + 1 : emptyRowIdx + 1;
      
      if (firstEmptyRow > this.sheet.getMaxRows()) {
        this.sheet.insertRowAfter(this.sheet.getMaxRows());
      }
      // --- END: Find first empty row ---


      // --- NEW LOGIC: Write data cell-by-cell ---
      // This will NOT overwrite formulas in other columns.
      this.sheet.getRange(firstEmptyRow, this._col('H') + 1).setValue(data.finalCost || "N/A");
      this.sheet.getRange(firstEmptyRow, this._col('J') + 1).setValue(data.invoiceNo || "N/A");
      this.sheet.getRange(firstEmptyRow, this._col('K') + 1).setValue(data.invoiceDate || "N/A");
      this.sheet.getRange(firstEmptyRow, this._col('L') + 1).setValue(data.supplier || "N/A");

      this.sheet.getRange(firstEmptyRow, this._col('S') + 1).setValue(data.vat8 || 0);
      this.sheet.getRange(firstEmptyRow, this._col('T') + 1).setValue(data.vat10 || 0);
      this.sheet.getRange(firstEmptyRow, this._col('U') + 1).setValue(data.vat5 || 0);
      this.sheet.getRange(firstEmptyRow, this._col('V') + 1).setValue(data.vat0 || 0);

      this.sheet.getRange(firstEmptyRow, this._col('W') + 1).setValue(data.totalBeforeTax || 0);
      this.sheet.getRange(firstEmptyRow, this._col('X') + 1).setValue(data.totalTaxAmount || 0);

      this.sheet.getRange(firstEmptyRow, this._col('Y') + 1).setValue(fileUrl);
      this.sheet.getRange(firstEmptyRow, this._col('Z') + 1).setValue(false); // Add unchecked checkbox
      
    } catch (e) {
      Logger.log(`Error writing to Google Sheet: ${e.toString()}`);
    }
  }

  /**
   * Finds all rows that are ready to be renamed.
   * @return {Array<Object>} An array of row objects to process.
   */
  getRowsToRename() {
    const data = this.sheet.getDataRange().getValues();
    const rowsToProcess = [];
    
    // Start from row 2 (index 1) to skip header
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Column indices (0-based): B=1, J=9, M=12, Y=24, Z=25
      const noMonth = row[this._col('B')];
      const fileUrl = row[this._col('Y')];
      const progress = row[this._col('Z')]; // Checkbox value
      
      // Filter condition: B has value, Y has value, and Z is false
      if (noMonth && fileUrl && progress === false) {
        rowsToProcess.push({
          rowIndex: i + 1,       // 1-based index for getRange
          noMonth: noMonth,
          invoiceNo: row[this._col('J')],
          supplierVT: row[this._col('M')],   // Col M
          fileUrl: fileUrl
        });
      }
    }
    return rowsToProcess;
  }

  /**
   * Sets the checkbox in Column Z to TRUE for a given row.
   * @param {number} rowIndex The 1-based row index to update.
   */
  updateProgress(rowIndex) {
    try {
      this.sheet.getRange(rowIndex, this._col('Z') + 1).setValue(true); // Column Z
    } catch (e) {
      Logger.log(`Failed to update progress checkbox for row ${rowIndex}: ${e.message}`);
    }
  }
}