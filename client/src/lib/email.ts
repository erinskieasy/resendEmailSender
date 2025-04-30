import { apiRequest } from "./queryClient";

interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
  apiKey: string | null;
}

export async function sendEmail(params: SendEmailParams) {
  if (!params.apiKey) {
    throw new Error("API key is not configured");
  }

  const response = await apiRequest("POST", "/api/send-email", {
    from: params.from,
    to: params.to,
    subject: params.subject,
    html: params.html
  });

  return response.json();
}
