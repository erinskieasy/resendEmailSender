import { useState } from "react";
import { ApiKeyForm } from "./ApiKeyForm";
import { EmailForm } from "./EmailForm";
import { useToast } from "@/hooks/use-toast";

export function EmailSender() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"not_configured" | "configured">("not_configured");
  const { toast } = useToast();

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    setApiStatus("configured");
    toast({
      title: "API key configured",
      description: "Your API key has been configured successfully.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end mb-2">
        <div className="flex items-center text-sm">
          <span 
            className={`w-2 h-2 rounded-full mr-2 ${
              apiStatus === "configured" ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span>
            {apiStatus === "configured" ? "API configured" : "API not configured"}
          </span>
        </div>
      </div>
      <ApiKeyForm onApiKeySet={handleApiKeySet} />
      <EmailForm apiKey={apiKey} apiConfigured={apiStatus === "configured"} />
    </div>
  );
}
