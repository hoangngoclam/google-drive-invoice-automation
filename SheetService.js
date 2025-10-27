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
   * --- NEW HELPER METHOD ---
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
   * --- UPDATED METHOD ---
   * Appends a new row to the sheet with extracted data, link, and checkbox.
   * Now uses the _col() helper for readability.
   * @param {Object} data The structured data object returned by the AI.
   * @param {string} fileUrl The Google Drive URL of the file.
   */
  logData(data, fileUrl) {
    try {
      // This still creates an array A-Z (26 columns)
      let rowData = new Array(26).fill(''); 

      // Populate data using column letters via the helper
      rowData[this._col('H')] = data.finalCost || "N/A";       // H: Pay Actual amount Details
      rowData[this._col('J')] = data.invoiceNo || "N/A";       // J: Invoice No
      rowData[this._col('K')] = data.invoiceDate || "N/A";    // K: Date invoice
      rowData[this._col('L')] = data.supplier || "N/A";       // L: Supplier
      
      rowData[this._col('S')] = data.vat8 || 0;               // R: VAT 8%
      rowData[this._col('T')] = data.vat10 || 0;              // S: VAT 10%
      rowData[this._col('U')] = data.vat5 || 0;               // T: VAT 5%
      rowData[this._col('V')] = data.vat0 || 0;               // U: VAT 0%

      rowData[this._col('W')] = data.totalBeforeTax || 0;     // V: Tổng tiền trước thuế
      rowData[this._col('X')] = data.totalTaxAmount || 0;     // W: Tiền thuế

      rowData[this._col('Y')] = fileUrl;                      // Y: Link
      rowData[this._col('Z')] = false;                        // Z: Progress (add as unchecked checkbox)
      
      this.sheet.appendRow(rowData);
      
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
      const noMonth = row[this._col("B")];
      const fileUrl = row[this._col("Y")];
      const progress = row[this._col("Z")]; // Checkbox value
      
      // Filter condition: B has value, Y has value, and Z is false
      if (noMonth && fileUrl && progress === false) {
        rowsToProcess.push({
          rowIndex: i + 1,       // 1-based index for getRange
          noMonth: noMonth,
          invoiceNo: row[9],
          supplierVT: row[12],   // Col M (as per your last script)
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
      this.sheet.getRange(rowIndex, 26).setValue(true); // Column Z is 26
    } catch (e) {
      Logger.log(`Failed to update progress checkbox for row ${rowIndex}: ${e.message}`);
    }
  }
}