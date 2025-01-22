"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { NameGenerator } from "@/model";
import { MapPin, Sparkles } from "lucide-react";
import { useState } from "react";

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
    <div className="min-h-screen bg-background dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <div className="flex flex-col items-center gap-2">
            <MapPin className="h-10 w-10 dark:text-slate-200" />
            <h1 className="text-2xl font-semibold dark:text-slate-200">
              Japanese City Explorer
            </h1>
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              Discover cities across Japan
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={generateCities}
            disabled={isGenerating}
            className="w-full"
            variant="default"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Cities"}
          </Button>

          {cities.length > 0 && (
            <div className="space-y-2 animate-in fade-in">
              <p className="text-lg font-medium dark:text-slate-200">
                {cities[0]}
              </p>
              {cities.slice(1).map((city, i) => (
                <p
                  key={i}
                  className="text-sm text-muted-foreground dark:text-slate-400"
                >
                  {city}
                </p>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-xs text-muted-foreground dark:text-slate-400 text-center w-full">
            Click the button to discover random Japanese cities
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
