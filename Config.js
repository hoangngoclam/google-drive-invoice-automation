// Get configuration from script properties
const SCRIPT_PROPS = PropertiesService.getScriptProperties();

const Config = {
  // New property you must add
  ROOT_FOLDER_ID: SCRIPT_PROPS.getProperty('ROOT_FOLDER_ID'), 

  // Existing properties
  GEMINI_API_KEY: SCRIPT_PROPS.getProperty('GEMINI_API_KEY'),
  SHEET_ID: SCRIPT_PROPS.getProperty('SHEET_ID'),

  // Static configuration
  SHEET_NAME: "Temp",
  SOURCE_FOLDER_NAME: "source",
  DEST_FOLDER_NAME: "1. Thanh toán OCB",
  YEAR_FOLDER_SUFFIX: " Thu nhập và chi phí / Income and expense",
  MONTH_FOLDER_SUFFIX: " Thu nhập và chi phí / Income and expense",

  // API URL
  GEMINI_API_URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${SCRIPT_PROPS.getProperty('GEMINI_API_KEY')}`
};