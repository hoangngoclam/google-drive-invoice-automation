# Gemini PDF Invoice Processor for Google Drive

[](https://www.google.com/script/start/)

This Google Apps Script project automates the processing of PDF invoices. It uses the Gemini AI API to extract structured data from PDFs found in a dynamic Google Drive folder, logs the data to a Google Sheet, and provides a utility to rename and track the processed files.

## Features

  * 🤖 **AI-Powered Extraction:** Uses the Gemini API to parse PDF invoices for key details (invoice number, supplier, VAT amounts, totals, etc.).
  * 📂 **Dynamic Folder Management:** Automatically finds and processes files from a Google Drive folder structure organized by year and month (e.g., `.../2025.10.../source`).
  * 📊 **Google Sheets Integration:** Logs all extracted data into a structured Google Sheet for accounting and tracking.
  * 🔄 **File Renaming & Tracking:** Includes a utility to batch-rename processed files based on sheet data and mark them as "complete" with a checkbox.
  * 🚀 **Custom UI Menu:** Provides a simple menu ("🚀 PDF Processor") within Google Sheets to trigger PDF processing and file renaming.

## Workflow

1.  A user places new PDF invoices into the current month's `source` folder.
2.  From the Google Sheet, the user runs the "Process New PDFs" script.
3.  The script sends each PDF to the Gemini API and receives structured JSON data.
4.  The script moves the original PDF to the month's `1. Thanh toán OCB` (destination) folder.
5.  The extracted data, a link to the file, and an "unchecked" progress box are added as a new row in the Google Sheet.
6.  The user can later fill in any manual data (like `No Month`) and run the "Update file name" script to rename the file in Google Drive and check the "Progress" box.

## Required Google Drive Folder Structure

This script relies on a specific folder structure. You **must** create this structure in your Google Drive.

```
(Your Root Folder)   <-- The ID of this folder is ROOT_FOLDER_ID
└── 📁 2025 Thu nhập và chi phí / Income and expense
    ├── 📁 2025.10 Thu nhập và chi phí / Income and expense
    │   ├── 📁 1. Thanh toán OCB   <-- (Destination Folder)
    │   └── 📁 source              <-- (Source Folder)
    ├── 📁 2025.11 Thu nhập và chi phí / Income and expense
    │   ├── 📁 1. Thanh toán OCB
    │   └── 📁 source
    └── ...
└── 📁 2026 Thu nhập và chi phí / Income and expense
    └── ...
```

## Prerequisites

1.  A Google Account (e.g., Gmail, Google Workspace).
2.  A Google Cloud Project.
3.  The **Generative Language API (Gemini)** enabled in your Google Cloud Project.
4.  An **API Key** for the Gemini API. [How to get an API key](https://ai.google.dev/gemini-api/docs/api-key).
5.  A Google Sheet.

## Setup Instructions

### 1\. Google Sheet Setup

1.  Create a new Google Sheet. Copy its ID from the URL:
    `.../spreadsheets/d/`**`<SHEET_ID_HERE>`**`/edit`
2.  Create a sheet (tab) inside and name it **`Temp`**.
3.  Set up the columns in the `Temp` sheet. The script specifically writes to these columns:
      * **H:** Pay Actual amount Details
      * **J:** Invoice No
      * **K:** Date invoice
      * **L:** Supplier
      * **S:** VAT 8%
      * **T:** VAT 10%
      * **U:** VAT 5%
      * **V:** VAT 0%
      * **W:** Tổng tiền trước thuế
      * **X:** Tiền thuế
      * **Y:** Link
      * **Z:** Progress (Format this column as checkboxes: `Data > Data validation > Criteria: Checkbox`)
      * *Note: Columns B ("No Month") and M ("Supplier VT") are read by the rename script, so they must also exist.*

### 2\. Google Drive Setup

1.  Create your main "root" folder in Google Drive. This will contain all your yearly folders.
2.  Copy its ID from the URL:
    `.../folders/`**`<ROOT_FOLDER_ID_HERE>`**
3.  Inside that folder, create the year/month structure exactly as shown in the **Folder Structure** section above.

### 3\. Apps Script Project Setup

1.  Open your Google Sheet.
2.  Go to **Extensions \> Apps Script** to open the script editor.
3.  You will see a default `Code.gs` file. Rename it to `Main.gs`.
4.  Create **4** new script files (`.gs`) using the `+` icon in the "Files" sidebar:
      * `Config.gs`
      * `DriveService.gs`
      * `GeminiService.gs`
      * `SheetService.gs`
5.  Copy the code from each file in this repository and paste it into the corresponding file in your Apps Script project.
6.  Save all 5 files.

### 4\. Configure Script Properties

1.  In the Apps Script editor, go to **Project Settings** ⚙️.
2.  In the **Script Properties** section, click **Add script property**.
3.  Add the following **3** properties:

| Property | Value |
| :--- | :--- |
| `ROOT_FOLDER_ID` | The Google Drive ID of your main root folder (from Step 2). |
| `SHEET_ID` | The Google Sheet ID (from Step 1). |
| `GEMINI_API_KEY` | Your Gemini API Key (from Prerequisites). |

### 5\. Enable Google Drive API

1.  In the Apps Script editor, look for the **Services** section in the left-hand sidebar.
2.  Click the `+` icon.
3.  Find **Google Drive API** in the list, select it, and click **Add**.

### 6\. Run and Authorize

1.  Go back to your Google Sheet and **refresh the page**.
2.  A new custom menu, **"🚀 PDF Processor"**, should appear.
3.  Click `🚀 PDF Processor > Process New PDFs`.
4.  An "Authorization Required" pop-up will appear. Follow the prompts to sign in and grant the script the necessary permissions (to access Google Drive, Sheets, and external services).

## Usage

### Processing New PDFs

1.  Add new PDF invoices to the correct `source` folder for the current month (e.g., `.../2025.10.../source`).
2.  In the Google Sheet, click **`🚀 PDF Processor > Process New PDFs`**.
3.  The script will process all PDFs in that folder, move them, and add their data to the `Temp` sheet.

### Renaming Files

1.  After processing, go to the `Temp` sheet.
2.  Fill in the required data for renaming, especially in **Column B ("No Month")**.
3.  Click **`🚀 PDF Processor > Update file name`**.
4.  The script will find all rows where the "Progress" checkbox (Column Z) is `FALSE`, rename the associated file in Google Drive, and then set the checkbox to `TRUE`.

-----

## License

This project is licensed under the MIT License.