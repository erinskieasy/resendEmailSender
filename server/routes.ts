import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Email sending endpoint
  app.post('/api/send-email', async (req, res) => {
    try {
      // Validate request body
      const emailData = emailSchema.parse(req.body);
      
      // Get API key from environment variable 
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Resend API key not configured on the server"
        });
      }
      
      // Send email using Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: emailData.from,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || 'Failed to send email'
        });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      
      console.error('Error sending email:', error);
      return res.status(500).json({ 
        error: 'Internal server error' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
