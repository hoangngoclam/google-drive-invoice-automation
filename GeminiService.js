class GeminiService {
  /**
   * @param {string} apiKey
   * @param {string} apiUrl
   */
  constructor(apiKey, apiUrl) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    
    // NOTE: I fixed a syntax error here. 
    // Your original prompt was missing a comma after "totalTaxAmount".
    this.prompt = `
    From the provided invoice PDF, please extract the following details. 
    All monetary values should be integers (numbers without any commas, periods, or currency symbols).

    Return the data in this exact JSON format:
    {
      "invoiceNo": "Số hóa đơn (Invoice No)",
      "invoiceDate": "Ngày hóa đơn (Date invoice) in DD/MM/YYYY format",
      "supplier": "Tên nhà cung cấp (Supplier/Seller name)",
      "vat8": "The VAT amount for the 8% tax rate. Return as an integer. If not present, return 0.",
      "vat10": "The VAT amount for the 10% tax rate. Return as an integer. If not present, return 0.",
      "vat5": "The VAT amount for the 5% tax rate. Return as an integer. If not present, return 0.",
      "vat0": "The VAT amount for the 0% tax rate. Return as an integer. If not present, return 0.",
      "totalBeforeTax": "Tổng tiền trước thuế (Total before tax) as an integer",
      "totalTaxAmount": "Tổng tiền thuế (Tiền thuế / Total tax amount) as an integer",
      "finalCost": "Tổng cộng tiền thanh toán sau thuế (Total) as an integer"
    }

    If any text information like invoiceNo, invoiceDate, or supplier cannot be found, use the value "N/A".
    For any VAT rate that is not mentioned in the invoice, its value must be 0.
  `;
  }

  /**
   * Sends a PDF file to the Gemini Vision API and returns the extracted text.
   * @param {GoogleAppsScript.Drive.File} file The PDF file to analyze.
   * @return {Object} The parsed JSON object from the AI's response, or null on failure.
   */
  extractInvoiceData(file) {
    const fileBlob = file.getBlob();
    const payload = {
      "contents": [
        {
          "parts": [
            { "text": this.prompt },
            {
              "inline_data": {
                "mime_type": "application/pdf",
                "data": Utilities.base64Encode(fileBlob.getBytes())
              }
            }
          ]
        }
      ]
    };

    const options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(payload),
      'muteHttpExceptions': true
    };

    try {
      const response = UrlFetchApp.fetch(this.apiUrl, options);
      const responseText = response.getContentText();

      if (response.getResponseCode() !== 200) {
        throw new Error(`API Error: ${responseText}`);
      }

      const jsonResponse = JSON.parse(responseText);
      
      if (!jsonResponse.candidates || !jsonResponse.candidates[0].content || !jsonResponse.candidates[0].content.parts || !jsonResponse.candidates[0].content.parts[0].text) {
        throw new Error(`Unexpected API response format: ${responseText}`);
      }
      
      const aiText = jsonResponse.candidates[0].content.parts[0].text;
      const cleanJsonText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(cleanJsonText);

    } catch (e) {
      Logger.log(`Failed to call or parse AI model response: ${e.toString()}`);
      return null;
    }
  }
}