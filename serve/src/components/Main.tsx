"use client";
import { NameGenerator } from "@/model";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const processName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1, name.length - 1);
};

export function Main() {
  const [cities, setCities] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCities = async () => {
    try {
      const generator = new NameGenerator("jp_cities_model.onnx");
      const names = await generator.generateNames(10);
      setCities(names.map(processName));
    } catch (err) {
      console.error("Error generating names:", err);
      setCities(["Error generating names"]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center p-8">
      <div className="text-sm uppercase tracking-widest text-zinc-500">
        Japanese City Name Generator
      </div>
      <div className="max-w-4xl w-full space-y-12 mt-32">
        <h1 className="text-8xl font-light tracking-tighter text-center break-words">
          {cities[0] || "Generate a name"}
        </h1>

        <div className="flex flex-col items-center space-y-12">
          <Button
            onClick={generateCities}
            disabled={isGenerating}
            className="w-48 h-12 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            {isGenerating ? "Generating..." : "Generate Names"}
          </Button>
        </div>
        <div className="text-4xl text-zinc-500 text-center grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
          {cities.slice(1).map((city, i) => (
            <div key={i} className="break-words">
              {city}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
