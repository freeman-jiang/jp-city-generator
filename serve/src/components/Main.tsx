"use client";
import { NameGenerator } from "@/model";
import { Github, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { ProgressiveLoad } from "./ProgressiveLoad";
import { Button } from "./ui/button";

const processName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1, name.length - 1);
};

export function Main() {
  const [cities, setCities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const generateCities = async () => {
    setError(null);
    setRegenerating(true);
    try {
      const generator = new NameGenerator("jp_cities_model.onnx");
      const names = await generator.generateNames(10);
      setCities(names.map(processName));
    } catch (err) {
      console.error("Error generating names:", err);
      setError(
        "ONNX model cannot run in this environment. Try using Chrome or Edge browser."
      );
      setCities([]);
    } finally {
      setTimeout(() => {
        setIsInitialLoading(false);
        setRegenerating(false);
      }, 600);
    }
  };

  useEffect(() => {
    generateCities();
  }, []);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center p-8 justify-center">
        <ProgressiveLoad duration={0.5}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-zinc-500" />
            <div className="text-zinc-500">Loading model...</div>
          </div>
        </ProgressiveLoad>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center p-8 justify-center">
        <div className="text-zinc-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-8 selection:bg-zinc-800 selection:text-zinc-200">
      <div className="absolute top-8 right-8">
        <ProgressiveLoad>
          <a
            href="https://github.com/freeman-jiang/jp-city-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors hidden sm:block"
          >
            <Github />
          </a>
        </ProgressiveLoad>
      </div>
      <ProgressiveLoad>
        <div />
      </ProgressiveLoad>
      <ProgressiveLoad>
        <div className="text-xs uppercase tracking-widest text-zinc-500 mt-1">
          Infinite Japanese City Generator
        </div>
      </ProgressiveLoad>
      <ProgressiveLoad delay={100}>
        <div className="text-xs uppercase tracking-widest text-zinc-500 mt-1">
          by{" "}
          <a href="https://www.freemanjiang.com" className="underline">
            Freeman Jiang
          </a>
        </div>
      </ProgressiveLoad>
      <div className="max-w-4xl w-full space-y-12 mt-32">
        <ProgressiveLoad key={cities[0]} delay={200}>
          <h1 className="text-6xl sm:text-8xl font-light tracking-tighter text-center break-words">
            {error || cities[0]}
          </h1>
        </ProgressiveLoad>

        <div className="flex flex-col items-center space-y-12">
          <ProgressiveLoad delay={400}>
            <Button
              onClick={generateCities}
              disabled={regenerating}
              className={`sm:w-48 w-56 sm:h-12 h-14 flex items-center justify-center gap-2 transition-all duration-300 ${
                regenerating
                  ? "scale-95 opacity-70"
                  : "hover:scale-105 hover:rotate-1"
              }`}
            >
              <Sparkles
                className={`${regenerating ? "animate-ping" : ""}`}
                size={16}
              />
              <span className="sm:text-base text-lg">
                {regenerating ? "Generating..." : "Make more"}
              </span>
            </Button>
          </ProgressiveLoad>
        </div>
        <div className="text-2xl sm:text-4xl text-zinc-600 text-center grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full tracking-tight">
          {cities.slice(1).map((city, i) => (
            <ProgressiveLoad key={`${city}-${i}`} delay={500 + i * 100}>
              <div className="break-words">{city}</div>
            </ProgressiveLoad>
          ))}
        </div>
      </div>
      <ProgressiveLoad
        delay={600}
        className="mt-auto pt-20 text-xs text-zinc-600 text-center w-full"
      >
        This model is a tiny (40K parameter){" "}
        <a
          href="https://en.wikipedia.org/wiki/Multilayer_perceptron"
          className="underline"
        >
          multilayer perceptron
        </a>{" "}
        running fully locally using the ONNX Runtime.
        <div>
          Trained on only <span className="font-semibold">1915</span> Japanese
          city names from the{" "}
          <a
            href="https://www.soumu.go.jp/denshijiti/code.html"
            className="underline"
          >
            Ministry of Internal Affairs and Communications
          </a>
          .
        </div>
      </ProgressiveLoad>
    </div>
  );
}
