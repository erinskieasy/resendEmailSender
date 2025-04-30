import { apiRequest } from "./queryClient";

// Interface defining parameters needed to send an email
interface SendEmailParams {
  from: string;  // Sender email address
  to: string;    // Recipient email address
  subject: string;  // Email subject line
  html: string;  // Email body content in HTML format
  // API key is no longer needed as a parameter since it's stored on the server
}

/**
 * Sends an email using the server-side Resend API
 * 
 * @param params - Object containing email details (from, to, subject, html)
 * @returns Promise with the API response data
 */
export async function sendEmail(params: SendEmailParams) {
  // Send the email request to our backend API endpoint
  const response = await apiRequest("POST", "/api/send-email", {
    from: params.from,
    to: params.to,
    subject: params.subject,
    html: params.html
  });

  // Return the parsed JSON response
  return response.json();
}
