# Copilot Instructions for Gemini PDF Invoice Processor

## Coding Rules
- Use ES6+ JavaScript syntax (let/const, arrow functions, template literals)
- Prefer Google Apps Script built-ins for Drive/Sheet operations
- Always surface errors to the user via `SpreadsheetApp.getUi().alert(error)`
- Use `showSnackbar` for progress feedback during batch operations
- Sheet columns are referenced by letter, use the `_col` helper for index conversion
- Do not hardcode folder or sheet IDs; always use Script Properties
- Keep service logic separated by file (see below)
- Avoid global variables except for configuration/constants
- All functions should be documented with JSDoc comments
- Use try/catch for all external API and file operations
- Do not use deprecated APIs (e.g., prefer `MimeType.PDF` alternatives if available)

## File Structure

```
appsscript.json           # Apps Script manifest
Config.js                 # Loads Script Properties, central config
DriveService.js           # Google Drive folder/file logic
GeminiService.js          # Gemini AI API integration
Main.js                   # Entry points, workflow orchestration, UI menu
SheetService.js           # Google Sheet data logging, row management
README.md                 # Setup, folder structure, usage instructions
.github/copilot-instructions.md # AI agent guidance (this file)
```

Each service file encapsulates a single responsibility:
- `DriveService.js`: Folder resolution, file moves, ID extraction
- `GeminiService.js`: PDF extraction via Gemini API
- `SheetService.js`: Data logging, row selection, progress tracking
- `Main.js`: Orchestrates workflows, handles UI, error alerts
## Project Overview
This Google Apps Script project automates PDF invoice extraction and management using Gemini AI and Google Drive/Sheets. The codebase is structured for Google Apps Script, with each major service in its own file:
- `Main.js`: Entry points, workflow orchestration, custom UI menu
- `Config.js`: Centralized configuration and Script Properties
- `DriveService.js`: Google Drive folder/file operations
- `GeminiService.js`: Handles Gemini AI API calls for PDF extraction
- `SheetService.js`: Google Sheet data logging, row management, and progress tracking

## Architecture & Data Flow
- **PDFs are placed in a dynamic Drive folder** (organized by year/month/source)
- **Main workflow** (`processPdfsInFolder`):
  1. Finds current month folders
  2. Iterates PDFs in `source`, sends to Gemini API
  3. Moves processed files to destination folder
  4. Logs extracted data + file link + progress checkbox to Google Sheet
- **Renaming workflow** (`renameFilesFromSheet`):
  1. Reads rows from the Sheet where B, Y are filled and Z is FALSE
  2. Renames files in Drive and marks progress as TRUE

## Key Patterns & Conventions
- **Column mapping**: Sheet columns are referenced by letter (e.g., 'J' for Invoice No), using a helper (`_col`) for 0-based index conversion
- **Progress tracking**: Column Z is a checkbox; only rows with Z=FALSE are processed for renaming
- **Error handling**: All errors are surfaced to the user via `SpreadsheetApp.getUi().alert(error)`
- **User feedback**: File processing progress is shown via `showSnackbar` for each file
- **Dynamic folder resolution**: DriveService locates folders based on current date/month
- **External API**: GeminiService expects a valid API key and endpoint, set in Script Properties

## Developer Workflow
- **Deploy/Push**: Use `clasp push` to deploy changes to Apps Script
- **Google Drive API**: Must be enabled in Apps Script project services
- **Script Properties**: Set `ROOT_FOLDER_ID`, `SHEET_ID`, and `GEMINI_API_KEY` in project settings
- **Custom UI**: The Google Sheet menu is created on open (`onOpen`)
- **Manual Data Entry**: Some columns (e.g., B) require manual input before renaming

## Integration Points
- **Google Drive**: Folder and file operations, requires correct folder structure
- **Google Sheets**: Data logging, progress tracking, and renaming logic
- **Gemini AI API**: PDF data extraction, requires API key and endpoint

## Examples
- To add a new data field, update both the column mapping in `SheetService.js` and the sheet structure
- To change folder logic, modify `DriveService.js` methods for folder resolution
- To customize error alerts, update catch blocks in `Main.js`

## References
- See `README.md` for setup, folder structure, and usage details
- Key files: `Main.js`, `Config.js`, `DriveService.js`, `GeminiService.js`, `SheetService.js`

## Commit Message Convention
- Start each commit message with a relevant emoji (see https://gitmoji.dev/)
- Keep messages short and descriptive (e.g., `🚀 Add PDF workflow`, `🐛 Fix VAT bug`)
- Example: `git commit -m "✨ Add GeminiService integration"`

---

If any conventions or workflows are unclear, please provide feedback so this guide can be improved.