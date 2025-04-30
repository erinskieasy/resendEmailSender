import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { sendEmail } from "@/lib/email";
import { useMutation } from "@tanstack/react-query";

// Attempt to dynamically import Quill only in browser
const QuillImportPromise = typeof window !== 'undefined' 
  ? import('quill').then(module => module.default)
  : Promise.resolve(null);

// Define schema for email form validation
const emailFormSchema = z.object({
  // Validate email format for sender
  from: z.string().email("Please enter a valid email"),
  // Validate email format for recipient
  to: z.string().email("Please enter a valid email"),
  // Require a non-empty subject
  subject: z.string().min(1, "Subject is required"),
});

// Create type based on the schema
type EmailFormValues = z.infer<typeof emailFormSchema>;

// EmailForm component definition - no longer requires props
export function EmailForm() {
  // Reference to the quill editor div element
  const quillRef = useRef<HTMLDivElement>(null);
  // State to store the quill editor instance
  const [quill, setQuill] = useState<any>(null);
  // Get toast notification functionality
  const { toast } = useToast();

  // Initialize the form with validation and default values
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      from: "no-reply@example.com", // Default sender email
      to: "", // Empty recipient by default
      subject: "", // Empty subject by default
    },
  });

  // Setup mutation for sending email
  const { mutate, isPending } = useMutation({
    mutationFn: sendEmail,
    onSuccess: () => {
      // Show success toast when email is sent
      toast({
        title: "Email sent successfully!",
        description: "Your email has been sent successfully.",
      });
      // Reset the form after successful submission
      handleReset();
    },
    onError: (error) => {
      // Show error toast if sending fails
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Initialize Quill editor when component mounts
  useEffect(() => {
    // Skip if the reference doesn't exist
    if (!quillRef.current) return;

    let quillInstance: any = null;

    const initQuill = async () => {
      try {
        // Load Quill dynamically
        const Quill = await QuillImportPromise;
        if (!Quill || !quillRef.current) return;

        // Create new Quill instance with toolbar options
        quillInstance = new Quill(quillRef.current, {
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              ['link', 'image'],
              ['clean']
            ]
          },
          placeholder: 'Compose your email content here...',
          theme: 'snow'
        });

        // Set initial sample content
        quillInstance.root.innerHTML = '<p>Hello,</p><p>This is a sample email sent using the Resend API.</p><p>Best regards,<br>Your Name</p>';
        
        // Store quill instance in state
        setQuill(quillInstance);
      } catch (error) {
        console.error("Error initializing Quill:", error);
      }
    };

    // Initialize the editor
    initQuill();

    // Cleanup function when component unmounts
    return () => {
      if (quillInstance) {
        // No official cleanup needed for Quill
        setQuill(null);
      }
    };
  }, []); // Empty dependency array so this runs once on mount

  // Handle form submission
  const onSubmit = (data: EmailFormValues) => {
    // Check if Quill editor is initialized
    if (!quill) {
      toast({
        title: "Error",
        description: "Email editor not initialized",
        variant: "destructive",
      });
      return;
    }

    // Get HTML content from editor
    const htmlContent = quill.root.innerHTML;
    // Validate content is not empty
    if (!htmlContent || htmlContent.trim() === "") {
      toast({
        title: "Error",
        description: "Email content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Send email using mutation
    mutate({
      from: data.from,
      to: data.to,
      subject: data.subject,
      html: htmlContent,
      // API key is no longer needed here - it's on the server
    });
  };

  // Handle form reset
  const handleReset = () => {
    // Reset form fields
    form.reset();
    // Reset quill editor content
    if (quill) {
      quill.root.innerHTML = '<p>Hello,</p><p>This is a sample email sent using the Resend API.</p><p>Best regards,<br>Your Name</p>';
    }
  };

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle>Send Email</CardTitle>
        <CardDescription>Compose and send an email using Resend API</CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* From field */}
            <FormField
              control={form.control}
              name="from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="noreply@yourdomain.com" 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">Must be a verified domain in your Resend account</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* To field */}
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="recipient@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Subject field */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter email subject" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Email body editor */}
            <div>
              <Label htmlFor="email-body">Email Content</Label>
              <div className="mt-1">
                <div 
                  id="email-editor" 
                  ref={quillRef} 
                />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-650 hover:bg-blue-700"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Email"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
