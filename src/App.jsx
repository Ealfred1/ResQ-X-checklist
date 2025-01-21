import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const downloadPDF = async () => {
    try {
      const response = await fetch('/guide.pdf');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ResQX-Emergency-Guide.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setError("Failed to download guide. Please try again.");
    }
  };

  const sendToBrevo = async (email) => {
    const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
    const BREVO_LIST_ID = parseInt(import.meta.env.VITE_BREVO_LIST_ID || "0");

    if (!BREVO_API_KEY) {
      throw new Error("Brevo API key is not configured");
    }

    try {
      await axios({
        method: "post",
        url: "https://api.brevo.com/v3/contacts",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        data: {
          email: email,
          attributes: {
            SIGNUP_DATE: new Date().toISOString(),
            SOURCE: "Emergency Guide Landing Page",
          },
          listIds: [BREVO_LIST_ID],
          updateEnabled: true,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await sendToBrevo(email);
      await downloadPDF();
      setShowSuccess(true);
      setEmail("");
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      setError("Failed to process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#3B3835] text-white overflow-x-hidden">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#3B3835]/80 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="text-2xl font-bold text-[#FF8500] hover:scale-105 transition-transform cursor-pointer">
            ResQ-X
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-32 pb-12">
        <section className="text-center mb-20 animate-[fadeIn_1s_ease-out]">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Never Get Stranded in{" "}
            <span className="text-[#FF8500]">Lagos</span> Again
          </h1>
          <p className="text-xl text-[#CCC8C4] max-w-2xl mx-auto leading-relaxed">
            Download our free guide on emergency vehicle services and learn how
            ResQ-X is revolutionizing roadside assistance.
          </p>
        </section>

        <section className="flex pl-3 flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-12">
            <h2 className="text-3xl font-bold">Inside The Guide:</h2>
            <ul className="space-y-10">
              {[
                {
                  icon: "⚡",
                  title: "Lightning Fast Response",
                  description:
                    "30-minute emergency response anywhere in Lagos",
                },
                {
                  icon: "🛡️",
                  title: "Professional Service",
                  description: "Vetted and trained emergency responders",
                },
                {
                  icon: "🚗",
                  title: "Complete Coverage",
                  description:
                    "From towing to fuel delivery, we've got you covered",
                },
              ].map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-6 animate-[fadeIn_1s_ease-out]"
                  style={{ animationDelay: `${index * 300}ms` }}
                >
                  <span className="text-4xl text-[#FF8500] transform hover:scale-110 transition-transform">
                    {feature.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-[#A89887] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 w-full">
            <div
              className="bg-white/5 backdrop-blur-lg p-10 rounded-3xl shadow-2xl animate-[fadeIn_1s_ease-out] border border-white/10 hover:border-[#FF8500]/30 transition-colors"
              style={{ animationDelay: "600ms" }}
            >
              {showSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-400">
                    Successfully Downloaded!
                  </h3>
                  <p className="text-[#A89887]">
                    Check your downloads folder for the guide.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold mb-4">
                    Get Your Free Guide
                  </h3>
                  <p className="text-[#A89887]">
                    Join thousands of Lagos drivers staying prepared
                  </p>
                  {error && (
                    <div className="text-red-400 text-sm py-2">{error}</div>
                  )}
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-4 bg-white/5 border-2 border-[#A89887] rounded-xl focus:border-[#FF8500] focus:outline-none transition-all hover:border-[#FF8500]/50 text-white placeholder:text-[#A89887]"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#FF8500] text-white py-4 rounded-xl hover:bg-[#FF8500]/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>
                        {isLoading ? "Downloading..." : "Download Free Guide"}
                      </span>
                      <span className="transform group-hover:translate-y-1 transition-transform">
                        ↓
                      </span>
                    </button>
                  </div>
                  <p className="text-center text-sm text-[#A89887] mt-6">
                    Your information is safe with us. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 mt-20">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#A89887]">
            &copy; 2024 ResQ-X. All rights reserved.
          </p>
          <nav className="flex gap-8">
            <a
              href="#"
              className="text-[#A89887] hover:text-[#FF8500] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[#A89887] hover:text-[#FF8500] transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-[#A89887] hover:text-[#FF8500] transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default App;