"use client"
import { useState } from "react";
import Canvas from "@/components/canvas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import { Sparkles } from "lucide-react"; 

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [triggerGenerate, setTriggerGenerate] = useState(false);

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* RETRO BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4f4f4f 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* HEADER */}
      <div className="z-10 text-center mb-8 space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-linear-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          PIXELIO_
        </h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest font-medium">
          AI-Powered Sprite Engine
        </p>
      </div>

      {/* THE CANVAS (My GOAT) */}
      <div className="z-10 relative group">
        {/* Glow Effect behind canvas */}
        <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-zinc-900 p-2 rounded-lg border border-zinc-800 shadow-2xl">
            {/* Pass props to your Canvas component here */}
            <Canvas prompt={prompt} shouldGenerate={triggerGenerate} onGenerateComplete={() => setTriggerGenerate(false)} />
        </div>
      </div>

      {/* CONTROLS */}
      <div className="z-10 mt-10 w-full max-w-lg px-4">
        <div className="flex gap-3 bg-zinc-900/80 backdrop-blur-md p-2 rounded-xl border border-zinc-800 shadow-xl ring-1 ring-white/5">
          <div className="relative grow">
            <Input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                // If Enter is pressed AND prompt isn't empty AND not already generating
                if (e.key === "Enter" && prompt.trim() && !triggerGenerate) {
                    setTriggerGenerate(true);
                }
              }}
              placeholder="Describe your sprite (e.g. 'cyberpunk katana')..." 
              className="bg-transparent border-none text-base md:text-lg h-10 md:h-12 placeholder:text-zinc-600 focus-visible:ring-0 text-white"
            />
          </div>
          
          <Button 
            onClick={() => setTriggerGenerate(true)}
            disabled={triggerGenerate || !prompt.trim()} // LOCK If generating OR if prompt is empty
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {triggerGenerate ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> 
                  Generating...
                </>
            ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
            )}
          </Button>
        </div>
        
        {/* Keyboard Hint */}
        <div className="text-center mt-3 hidden md:block">
             <span className="text-xs text-zinc-600">Press <kbd className="font-mono bg-zinc-800 px-1 rounded text-zinc-400">Enter</kbd> to generate</span>
        </div>
      </div>

    </main>   
  )
}