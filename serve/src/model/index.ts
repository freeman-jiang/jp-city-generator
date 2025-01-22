"use client";
import * as ort from "onnxruntime-web";
import { Tensor } from "onnxruntime-web";

// Constants (these would come from your training data)
const BLOCK_SIZE = 10; // Replace with your actual block size
// You'll need to populate this with your actual mapping
// Example: itos = {0: '', 1: 'a', 2: 'b', ...}

const itos = {
  "1": "-",
  "2": "a",
  "3": "b",
  "4": "c",
  "5": "d",
  "6": "e",
  "7": "f",
  "8": "g",
  "9": "h",
  "10": "i",
  "11": "j",
  "12": "k",
  "13": "l",
  "14": "m",
  "15": "n",
  "16": "o",
  "17": "p",
  "18": "r",
  "19": "s",
  "20": "t",
  "21": "u",
  "22": "w",
  "23": "y",
  "24": "z",
  "25": "ō",
  "26": "ū",
  "0": ".",
} as {
  [key: string]: string;
};

export class NameGenerator {
  private session!: ort.InferenceSession;
  private inputName!: string;
  private outputName!: string;

  private _modelPath: string;
  private _initialized = false;

  constructor(modelPath: string) {
    this._modelPath = modelPath;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this._initialized) {
      await this.initialize(this._modelPath);
      this._initialized = true;
    }
  }

  private async initialize(modelPath: string): Promise<void> {
    // Create ONNX Runtime session
    this.session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });

    // Get input and output names
    this.inputName = this.session.inputNames[0];
    this.outputName = this.session.outputNames[0];
  }

  private softmax(logits: Float32Array): Float32Array {
    const maxLogit = Math.max(...logits);
    const expLogits = logits.map((l) => Math.exp(l - maxLogit));
    const sumExp = expLogits.reduce((a, b) => a + b, 0);
    return new Float32Array(expLogits.map((exp) => exp / sumExp));
  }

  private weightedRandomChoice(probs: Float32Array): number {
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < probs.length; i++) {
      sum += probs[i];
      if (r <= sum) return i;
    }
    return probs.length - 1;
  }

  public async generateName(): Promise<string> {
    await this.ensureInitialized();

    // Initialize context with zeros
    let context = new Array(BLOCK_SIZE).fill(0);
    const out: number[] = [];

    while (true) {
      // Prepare input tensor - convert numbers to BigInt
      const inputTensor = new Tensor(
        "int64",
        BigInt64Array.from(context.map((n) => BigInt(n))),
        [1, BLOCK_SIZE]
      );

      // Run inference
      const outputs = await this.session.run({
        [this.inputName]: inputTensor,
      });

      // Get logits from output
      const logits = outputs[this.outputName].data as Float32Array;

      // Calculate probabilities using softmax
      const probs = this.softmax(logits);

      // Sample from probability distribution
      const ix = this.weightedRandomChoice(probs);

      // Update context and track output
      context = [...context.slice(1), ix];
      out.push(ix);

      // Break if we generate the end token (0) and have at least 3 chars
      if (ix === 0) {
        if (out.length > 3) {
          break;
        } else {
          out.pop(); // Remove the . token
          continue;
        }
      }
    }

    const result = out.map((i) => itos[i.toString()]).join("");
    return result;
  }

  public async generateNames(count: number): Promise<string[]> {
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await this.generateName();
      names.push(name);
    }
    return names;
  }
}

// Usage example:
export async function generateNames(count: number): Promise<string[]> {
  const generator = new NameGenerator("jp_cities_model.onnx");
  const names: string[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const name = await generator.generateName();
      names.push(name);
    } catch (e) {
      console.error(`Error generating name ${i}: `, e);
    }
  }

  return names;
}
