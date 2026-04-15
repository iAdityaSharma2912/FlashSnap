"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { PdfUpload } from "@/components/generate/pdf-upload";
import { GenerationProgress } from "@/components/generate/generation-progress";
import { FlashcardGrid } from "@/components/flashcards/flashcard-grid";
import { ExportPanel } from "@/components/decks/export-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { GeneratedFlashcard } from "@/lib/types";
import type { Flashcard } from "@/lib/types";
import {
  Upload,
  Tag,
  Sparkles,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Settings2,
  BookOpen,
  BrainCircuit,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "pdf" | "topic";

export default function GeneratePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("pdf");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [cardCount, setCardCount] = useState(20);
  const [deckTitle, setDeckTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[] | null>(null);
  const [savedDeckId, setSavedDeckId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (mode === "pdf" && !pdfFile) {
      toast({ title: "No PDF selected", description: "Please upload a PDF file first.", variant: "error" });
      return;
    }
    if (mode === "topic" && !topic.trim()) {
      toast({ title: "No topic entered", description: "Please enter a topic to generate cards for.", variant: "error" });
      return;
    }

    setIsGenerating(true);
    setGeneratedCards(null);
    setSavedDeckId(null);

    try {
      let pdfText: string | undefined;
      let fileName: string | undefined;

      // Step 1: Extract PDF text
      if (mode === "pdf" && pdfFile) {
        setIsExtracting(true);
        const formData = new FormData();
        formData.append("file", pdfFile);
        const extractRes = await fetch("/api/extract-pdf", { method: "POST", body: formData });
        const extractData = await extractRes.json();
        setIsExtracting(false);

        if (!extractData.success) {
          throw new Error(extractData.error ?? "Failed to extract PDF text");
        }
        pdfText = extractData.data.text;
        fileName = extractData.data.fileName;

        if (!deckTitle) {
          setDeckTitle(pdfFile.name.replace(".pdf", "").replace(/[-_]/g, " "));
        }
      }

      if (mode === "topic" && !deckTitle) {
        setDeckTitle(topic);
      }

      // Step 2: Generate flashcards
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          topic: mode === "topic" ? topic : undefined,
          description,
          pdfText,
          fileName,
          cardCount,
        }),
      });

      const genData = await genRes.json();
      if (!genData.success) throw new Error(genData.error ?? "Generation failed");

      setGeneratedCards(genData.data.flashcards);
      toast({
        title: "Flashcards generated",
        description: `${genData.data.flashcards.length} cards ready to study`,
      });
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "error",
      });
    } finally {
      setIsGenerating(false);
      setIsExtracting(false);
    }
  }, [mode, pdfFile, topic, description, cardCount, deckTitle]);

  const handleSaveDeck = async () => {
    if (!generatedCards || !session?.user) {
      if (!session?.user) {
        toast({ title: "Sign in required", description: "Create an account to save your deck." });
        router.push("/login");
      }
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: deckTitle || (mode === "topic" ? topic : pdfFile?.name) || "Untitled Deck",
          description,
          userId: (session.user as { id?: string }).id,
          cards: generatedCards,
          sourceType: mode === "pdf" ? "PDF" : "TOPIC",
          sourceFile: pdfFile?.name,
          topic: mode === "topic" ? topic : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSavedDeckId(data.data.id);
      toast({ title: "Deck saved", description: "Your deck has been saved to your library." });
    } catch (err) {
      toast({ title: "Save failed", description: err instanceof Error ? err.message : "Could not save deck", variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setGeneratedCards(null);
    setPdfFile(null);
    setTopic("");
    setDescription("");
    setDeckTitle("");
    setSavedDeckId(null);
  };

  // Convert GeneratedFlashcard to Flashcard for display
  const displayCards: Flashcard[] = (generatedCards ?? []).map((c, i) => ({
    id: `preview-${i}`,
    question: c.question,
    answer: c.answer,
    hint: c.hint ?? null,
    explanation: c.explanation ?? null,
    topic: c.topic ?? null,
    difficulty: c.difficulty ?? "MEDIUM",
    deckId: "preview",
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date().toISOString(),
    mastery: "NEW",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const inputClasses = (isFocused: boolean) => cn(
    "w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-gray-600 rounded-xl focus-visible:ring-2 outline-none transition-all",
    isFocused ? "border-blue-500 ring-2 ring-blue-500/20" : "focus-visible:ring-blue-500/50 focus-visible:border-blue-500"
  );

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-sans selection:bg-orange-500/30 selection:text-white pb-20">
      <Navbar />
      
      {/* Subtle Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-12 relative z-10">

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
            Generate Flashcards
          </h1>
          <p className="text-base text-gray-400 font-medium">
            Upload a PDF or enter a topic to create study-ready cards instantly.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 p-1.5 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl mb-10 w-fit mx-auto md:mx-0">
          {[
            { value: "pdf" as const, label: "From PDF", icon: Upload },
            { value: "topic" as const, label: "From Topic", icon: Tag },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => { setMode(value); setGeneratedCards(null); }}
              disabled={isGenerating}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
                mode === value
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-zinc-800/50"
              )}
            >
              <Icon className={cn("w-4 h-4", mode === value ? "text-blue-400" : "")} />
              {label}
            </button>
          ))}
        </div>

        {!generatedCards ? (
          /* Generation form */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              {/* Input area */}
              {mode === "pdf" ? (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-300">PDF Document</Label>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden hover:border-blue-500/30 transition-colors">
                    <PdfUpload file={pdfFile} onFile={setPdfFile} disabled={isGenerating} />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label 
                      htmlFor="topic" 
                      className={cn("text-sm font-semibold transition-colors", focusedInput === "topic" ? "text-blue-400" : "text-gray-300")}
                    >
                      Subject / Topic
                    </Label>
                    <Input
                      id="topic"
                      placeholder="e.g. Photosynthesis, French Revolution, React Hooks"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      disabled={isGenerating}
                      onFocus={() => setFocusedInput("topic")}
                      onBlur={() => setFocusedInput(null)}
                      className={inputClasses(focusedInput === "topic")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      htmlFor="description" 
                      className={cn("text-sm font-semibold transition-colors", focusedInput === "description" ? "text-blue-400" : "text-gray-300")}
                    >
                      Syllabus / Details <span className="text-gray-600 font-normal">(optional)</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Paste your syllabus or specify sub-topics to cover..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      disabled={isGenerating}
                      onFocus={() => setFocusedInput("description")}
                      onBlur={() => setFocusedInput(null)}
                      className={inputClasses(focusedInput === "description")}
                    />
                  </div>
                </div>
              )}

              {/* Deck title */}
              <div className="space-y-2">
                <Label 
                  htmlFor="deck-title" 
                  className={cn("text-sm font-semibold transition-colors", focusedInput === "deckTitle" ? "text-blue-400" : "text-gray-300")}
                >
                  Deck Title <span className="text-gray-600 font-normal">(optional)</span>
                </Label>
                <Input
                  id="deck-title"
                  placeholder="Give your deck a custom name..."
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  disabled={isGenerating}
                  onFocus={() => setFocusedInput("deckTitle")}
                  onBlur={() => setFocusedInput(null)}
                  className={inputClasses(focusedInput === "deckTitle")}
                />
              </div>

              {/* Advanced options */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                <button
                  onClick={() => setShowAdvanced((s) => !s)}
                  className="flex items-center justify-between w-full px-5 py-4 text-sm font-semibold text-gray-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Advanced options
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showAdvanced && (
                  <div className="px-5 pb-5 border-t border-zinc-800 pt-5 space-y-4 bg-zinc-900/30">
                    <div className="space-y-4">
  <Label htmlFor="card-count-slider" className="text-gray-300">
    Target Card Count: <span className="text-white font-bold">{cardCount}</span>
  </Label>
  <input
    id="card-count-slider"
    aria-label="Target Card Count"
    type="range"
    min={5}
    max={50}
    step={5}
    value={cardCount}
    onChange={(e) => setCardCount(Number(e.target.value))}
    className="w-full accent-blue-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
    disabled={isGenerating}
  />
                      <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>5 (Quick Review)</span>
                        <span>50 (Comprehensive)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column — info + CTA */}
            <div className="lg:col-span-2 space-y-6">
              {isGenerating ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-orange-500 animate-pulse" />
                  <GenerationProgress isGenerating={isGenerating} cardCount={cardCount} />
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 space-y-5 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">What you get</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-gray-300">
                      {[
                        "Deep concept extraction",
                        "Teacher-quality Q&A pairs",
                        "Contextual hints included",
                        "Pre-assigned difficulty ratings",
                        "Ready for spaced repetition",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleGenerate}
                    disabled={isGenerating || (mode === "pdf" ? !pdfFile : !topic.trim())}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-400 hover:to-orange-500 shadow-[0_0_30px_-10px_rgba(249,115,22,0.5)] hover:-translate-y-1 transition-all duration-300 gap-2 rounded-xl disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate {cardCount} Flashcards
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Actions bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-3 text-base font-medium text-gray-200">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-500 font-bold text-xl">
                    {displayCards.length}
                  </span>
                  <span className="text-gray-400 ml-1">cards generated</span>
                  {deckTitle && (
                    <span className="text-white font-bold ml-2 hidden sm:inline-block">— {deckTitle}</span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Button variant="outline" onClick={reset} className="gap-2 bg-transparent border-zinc-800 text-gray-300 hover:bg-zinc-900 hover:text-white rounded-lg flex-1 md:flex-none">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                
                <div className="flex-1 md:flex-none">
                  <ExportPanel
                    deckTitle={deckTitle || topic || pdfFile?.name || "FlashSnap Deck"}
                    cards={displayCards}
                  />
                </div>

                {!savedDeckId ? (
                  <Button
                    onClick={handleSaveDeck}
                    disabled={isSaving}
                    className="gap-2 bg-white text-black hover:bg-gray-200 font-bold rounded-lg shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] flex-1 md:flex-none"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Deck"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push(`/decks/${savedDeckId}`)}
                    className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 border-0 font-bold rounded-lg flex-1 md:flex-none"
                  >
                    <BookOpen className="w-4 h-4" />
                    View Deck
                  </Button>
                )}
              </div>
            </div>

            {/* Cards grid */}
            <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50">
               <FlashcardGrid cards={displayCards} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}