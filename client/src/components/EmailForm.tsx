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

const emailFormSchema = z.object({
  from: z.string().email("Please enter a valid email"),
  to: z.string().email("Please enter a valid email"),
  subject: z.string().min(1, "Subject is required"),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

interface EmailFormProps {
  apiKey: string | null;
  apiConfigured: boolean;
}

export function EmailForm({ apiKey, apiConfigured }: EmailFormProps) {
  const quillRef = useRef<HTMLDivElement>(null);
  const [quill, setQuill] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      from: "no-reply@example.com",
      to: "",
      subject: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: sendEmail,
    onSuccess: () => {
      toast({
        title: "Email sent successfully!",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Initialize Quill editor
  useEffect(() => {
    if (!quillRef.current) return;

    let quillInstance: any = null;

    const initQuill = async () => {
      try {
        const Quill = await QuillImportPromise;
        if (!Quill || !quillRef.current) return;

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

        // Sample content
        quillInstance.root.innerHTML = '<p>Hello,</p><p>This is a sample email sent using the Resend API.</p><p>Best regards,<br>Your Name</p>';
        
        setQuill(quillInstance);
      } catch (error) {
        console.error("Error initializing Quill:", error);
      }
    };

    initQuill();

    return () => {
      if (quillInstance) {
        // No official cleanup needed for Quill
        setQuill(null);
      }
    };
  }, []);

  const onSubmit = (data: EmailFormValues) => {
    if (!quill) {
      toast({
        title: "Error",
        description: "Email editor not initialized",
        variant: "destructive",
      });
      return;
    }

    const htmlContent = quill.root.innerHTML;
    if (!htmlContent || htmlContent.trim() === "") {
      toast({
        title: "Error",
        description: "Email content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    mutate({
      from: data.from,
      to: data.to,
      subject: data.subject,
      html: htmlContent,
      apiKey
    });
  };

  const handleReset = () => {
    form.reset();
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
            <FormField
              control={form.control}
              name="from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="noreply@yourdomain.com" 
                      disabled={!apiConfigured}
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">Must be a verified domain in your Resend account</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="recipient@example.com" 
                      disabled={!apiConfigured}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter email subject" 
                      disabled={!apiConfigured}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <Label htmlFor="email-body">Email Content</Label>
              <div className="mt-1">
                <div 
                  id="email-editor" 
                  ref={quillRef} 
                  className={apiConfigured ? "" : "opacity-50 pointer-events-none"}
                />
              </div>
            </div>
            
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
                disabled={!apiConfigured || isPending}
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
