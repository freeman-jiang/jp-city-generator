"use client";
import { NameGenerator } from "@/model";
import { MapPin, Sparkles } from "lucide-react";
import { useState } from "react";

// Curated list of Japanese cities with their regions
const japaneseCities = [
  "Tokyo (東京) - Kanto",
  "Kyoto (京都) - Kansai",
  "Osaka (大阪) - Kansai",
  "Sapporo (札幌) - Hokkaido",
  "Fukuoka (福岡) - Kyushu",
  "Nagoya (名古屋) - Chubu",
  "Yokohama (横浜) - Kanto",
  "Kobe (神戸) - Kansai",
  "Nara (奈良) - Kansai",
  "Hiroshima (広島) - Chugoku",
  "Sendai (仙台) - Tohoku",
  "Kanazawa (金沢) - Chubu",
  "Matsuyama (松山) - Shikoku",
  "Nagasaki (長崎) - Kyushu",
  "Kamakura (鎌倉) - Kanto",
];

const processName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export function Main() {
  const [cities, setCities] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCities = async () => {
    try {
      const generator = new NameGenerator("jp_cities_model.onnx");
      const names = await generator.generateNames(5);
      setCities(names.map(processName));
    } catch (err) {
      console.error("Error generating names:", err);
      setCities(["Error generating names"]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <MapPin className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Japanese City Explorer
          </h1>
          <p className="text-gray-600">
            Discover beautiful cities across Japan
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={generateCities}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg 
                     shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 
                     flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            <span>{isGenerating ? "Generating..." : "Generate Cities"}</span>
          </button>

          {cities.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 text-center animate-fade-in space-y-2">
              <p className="text-lg font-medium text-gray-900">{cities[0]}</p>
              {cities.slice(1).map((city, i) => (
                <p key={i} className="text-md text-gray-500">
                  {city}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Click the button to discover random Japanese cities</p>
        </div>
      </div>
    </div>
  );
}
