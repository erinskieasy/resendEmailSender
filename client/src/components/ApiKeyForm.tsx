import { useState } from "react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyFormProps {
  onApiKeySet: (key: string) => void;
}

export function ApiKeyForm({ onApiKeySet }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    
    if (!trimmedKey.startsWith("re_")) {
      toast({
        title: "Invalid API key format",
        description: "Resend API keys start with \"re_\"",
        variant: "destructive",
      });
      return;
    }
    
    onApiKeySet(trimmedKey);
  };

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle>API Configuration</CardTitle>
        <CardDescription>Configure your Resend API key to send emails</CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="api-key">Resend API Key</Label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="re_1234..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-12"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  {showApiKey ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-blue-650 hover:bg-blue-700">
              Configure API Key
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
