import { EmailSender } from "@/components/EmailSender";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Email Sender</h1>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmailSender />
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">Powered by Resend API</p>
        </div>
      </footer>
    </div>
  );
}
