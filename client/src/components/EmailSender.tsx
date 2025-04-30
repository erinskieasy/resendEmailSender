// Import the EmailForm component for composing and sending emails
import { EmailForm } from "./EmailForm";

export function EmailSender() {
  // The EmailSender component is now much simpler since we're using
  // a server-side API key instead of requiring user input
  
  return (
    <div className="space-y-8">
      {/* Display the EmailForm component */}
      <EmailForm />
    </div>
  );
}
