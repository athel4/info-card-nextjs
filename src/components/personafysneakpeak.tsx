import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface PersonafyPreviewModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PersonafyPreviewModal({ open, onClose }: PersonafyPreviewModalProps) {
  const [step, setStep] = useState(0);
  const [userPrompt, setUserPrompt] = useState("");
  const [typingComplete, setTypingComplete] = useState(false); 
  const scrollRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null); // NEW: for auto-scroll in typing area

  // Constants
  const TYPING_SPEED = 30;
  const ANALYSIS_DELAY = 1000;
  const SPOTLIGHT_DELAYS = [2000, 5000, 8000];
  
  const simulatedPrompt =
    "The target is laid back, wears a light blue shirt with dotted patterns. " +
    "He walks and talks fast, loves sharing his vision for the company, " +
    "emphasizes achievements but dismisses praise as luck.";

  /** Typing simulation logic */
  useEffect(() => {
    if (open) {
      setStep(0);
      setUserPrompt("");
      setTypingComplete(false);

      let idx = 0;
      const typeInterval = setInterval(() => {
        if (idx < simulatedPrompt.length) {
          setUserPrompt((prev) => prev + simulatedPrompt[idx]);
          idx++;

          // Auto-scroll typing container to bottom
          if (promptRef.current) {
            promptRef.current.scrollTop = promptRef.current.scrollHeight;
          }
        } else {
          clearInterval(typeInterval);

          // Once typing is finished:
          setTimeout(() => {
            setTypingComplete(true);

            // Automatically proceed to Step 2
            setTimeout(() => setStep(2), ANALYSIS_DELAY);
          }, 500);
        }
      }, TYPING_SPEED);

      return () => clearInterval(typeInterval);
    }
  }, [open]);

  /** Spotlight progression */
  useEffect(() => {
    if (open && step >= 2) {
      const timers = SPOTLIGHT_DELAYS.map((delay, index) => 
        setTimeout(() => setStep(3 + index), delay)
      );
      return () => timers.forEach((t) => clearTimeout(t));
    }
  }, [open, step]);

  /** Smooth scroll spotlight */
  useEffect(() => {
    if (scrollRef.current && step >= 3) {
      const container = scrollRef.current;
      const sections = container.querySelectorAll("p");
      const targetSection = sections[step - 3];
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [step]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          max-w-md 
          bg-background text-foreground 
          border border-secondary 
          shadow-lg
        "
      >
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-xl text-center flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Meet <span className="font-bold text-purple-600">PERSONAFY</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Intro */}
          <p className="text-center text-muted-foreground">
            Imagine instantly knowing <strong>exactly what to say</strong> to every lead.
            <br />
            <span className="text-purple-600 font-semibold">PERSONAFY</span> uses behavioral intelligence to craft{" "}
            <strong>messages that connect and close</strong>.
            <br />
            <strong>Launching soon — exclusively for Enterprise (RM55) subscribers.</strong>
          </p>
		  <div style={{ marginBottom: '2rem' }}>
			  {/* Step 0 & 1: Typing simulation */}
			  {step < 2 && (
				<div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
				  <label className="block text-sm text-gray-500 mb-1">Your Observation</label>
				  <div className="relative">
					<div className="absolute w-full h-full top-[0]"></div>
					<div
					  ref={promptRef}
					  className="
						overflow-y-auto
						w-full p-2 border rounded bg-white dark:bg-gray-900 
						h-20 text-sm font-mono
					  "
					>
					  {userPrompt}
					  <span className="animate-pulse">|</span>
					</div>

					{/* Optional button (visual only, no longer required to click) */}
					{typingComplete && step === 0 && (
					  <Button
						className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm hover:shadow-md cursor-pointer"
						onClick={() => setStep(2)}
					  >
						Submit for Analysis
					  </Button>
					)}
				  </div>
				</div>
			  )}

			  {/* Demo Animation Container */}
			  {step >= 2 && (
				<div
				  ref={scrollRef}
				  className="
					rounded-lg p-4 border 
					bg-secondary 
					relative overflow-hidden 
					max-h-48 
					overflow-y-hidden
				  "
				>
				  {/* Step 2: Analyzing Contact */}
				  {step === 2 && (
					<div className="flex flex-col items-center space-y-2">
					  <p className="text-sm font-medium text-gray-600 animate-pulse">
						Analyzing contact details...
					  </p>
					  <div className="space-y-2 w-full">
						<div className="h-3 w-3/4 bg-gray-300 rounded animate-pulse"></div>
						<div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
					  </div>
					</div>
				  )}

				  {/* Step 3+: Spotlight */}
				  {step >= 3 && (
					<div className="relative space-y-6">
					  {/* Section 1 */}
					  <p
						className={`transition-all duration-700 ${
						  step === 3 ? "opacity-100 blur-0" : "opacity-40 blur-[2px]"
						}`}
					  >
						Hi Alex, I noticed how you balance a calm, approachable vibe with a fast-moving,
						high-energy way of speaking — that blend really draws people in while keeping them engaged.
					  </p>

					  {/* Section 2 */}
					  <p
						className={`transition-all duration-700 ${
						  step === 4 ? "opacity-100 blur-0" : "opacity-40 blur-[2px]"
						}`}
					  >
						It’s clear your vision for your company isn’t just about growth,
						but about inspiring others to achieve something bigger. When approaching someone like you,
						it’s key to align with that vision while providing a practical next step
						that connects directly to your goals.
					  </p>

					  {/* Section 3 */}
					  <p
						className={`transition-all duration-700 ${
						  step === 5 ? "opacity-100 blur-0" : "opacity-40 blur-[2px]"
						}`}
					  >
						Focus on their dreams first, then position your solution as the natural next step to achieve them.
					  </p>

					  {/* Final blurred locked content */}
					  <p className="opacity-40 blur-sm" aria-hidden="true">
						Here’s exactly how you can frame the conversation so it feels authentic,
						builds trust, and guides them naturally toward saying yes...
					  </p>
					</div>
				  )}
				</div>
			  )}
		  </div>
          {/* CTA */}
          <Button
            className="
              w-full 
              bg-purple-600 hover:bg-purple-700 
              text-white font-semibold text-lg shadow-md hover:shadow-lg cursor-pointer
            "
            onClick={() =>
              window.open("https://chat.whatsapp.com/LKbP0OIuOHL5h8m92NI6qX", "_blank")
            }
          >
            Reserve My Access
          </Button>

          {/* FOMO Subtext */}
          <p className="text-xs text-center text-muted-foreground">
            ⚡ Be first to unlock <span className="text-purple-600 font-semibold">PERSONAFY</span> and stay ahead of the competition.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
