"use client"
import { useState, useRef, useEffect } from "react"
import { Download } from "lucide-react" 

interface CanvasProps {
    prompt: string;
    shouldGenerate: boolean;
    onGenerateComplete: () => void;
}

export default function Canvas({ prompt, shouldGenerate, onGenerateComplete }: CanvasProps) {

    const ref = useRef<HTMLCanvasElement | null>(null)
    const [gridData, setGridData] = useState<number[][]>([])
    const [isGenerating, setIsGenerating] = useState(false)

    // Configuration
    const CELL_SIZE = 16;
    const ROWS = 32;
    const COLS = 32;

    const handleDownload = () => {
        const canvas = ref.current;
        if (!canvas) return;

        // Convert the canvas pixels to a data URL (image format)
        const imageURI = canvas.toDataURL("image/png");

        // Create a temporary link element to trigger the download
        const link = document.createElement("a");
        // Name the file based on the prompt 
        link.download = `${prompt.trim().replace(/\s+/g, "_") || "pixel_art"}.png`;
        link.href = imageURI;
        
        // Click it programmatically
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (shouldGenerate && prompt) {
            handleGenAi()
        }
    }, [shouldGenerate, prompt])

    useEffect(() => {
        const canvas = ref.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // CLEAR CANVAS first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gridData.length === 0) return;

        const palette = ["#ffffff", "#000000", "#e74c3c", "#3498db", "#2ecc71", "#f1c40f"];

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const pixelValue = gridData[row]?.[col] || 0;
                if (pixelValue === 0) continue;
                const x = col * CELL_SIZE
                const y = row * CELL_SIZE
                

                ctx.fillStyle = palette[pixelValue] || "#ffffff";
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
            }
        }

    }, [gridData])

    const handleGenAi = async () => {
        if (!prompt) return
        setIsGenerating(true)

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userPrompt: prompt }),
            })

            if (!response.ok) throw new Error("Api failed")

            const result = await response.json()

            if (result.data) {
                setGridData(result.data)
            }
        }
        finally {
            setIsGenerating(false)
            onGenerateComplete()
        }
    }

    return (
        // 1. CONTAINER: 
        // - 'w-full': Take up available phone screen width
        // - 'max-w-[512px]': Don't get bigger than 512px on Desktop
        // - 'aspect-square': Force it to stay a perfect square (prevents stretching)
        // - 'mx-auto': Center it horizontally
        <div className="relative group w-full max-w-[512px] aspect-square mx-auto">
            
            <canvas 
                ref={ref} 
                id="grid"
                width={512} 
                height={512}
                className="w-full h-full rounded-lg shadow-lg bg-white [image-rendering:pixelated]" 
            />
            
            {/* Download Button */}
            {gridData.length > 0 && (
                <button 
                    onClick={handleDownload}
                    className="absolute top-4 right-4 bg-white/90 text-black p-2 rounded-md shadow-lg 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300
                               hover:bg-white hover:scale-105 active:scale-95 touch-manipulation"
                    title="Download PNG"
                >
                    <Download size={20} />
                </button>
            )}
            
            {/* Loading Overlay */}
            {isGenerating && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg backdrop-blur-sm">
                    <span className="text-white font-bold animate-pulse">Generating...</span>
                </div>
            )}
        </div>
    )
}