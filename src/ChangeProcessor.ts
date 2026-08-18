import type { LocationData } from "./hooks/useGeolocation.ts";
import * as currency from "./types/currency.ts"
import { currencyForCountry } from "./currencyForCountry.ts";

export interface Config {
  currency: "USD" | "EUR" | "GBP";
  randomDivisor: number;
}

export interface ChangeResult {
  mode: "normal" | "random";
  value: string | undefined;
  error: string | undefined;
  key: string;
}

export class ChangeProcessor {
  private config: Config;
  private mode: "normal" | "random";

  constructor() {
    this.mode = "normal";
    this.config = { currency: "USD", randomDivisor: 3 };
  }

  public setLocation(location: LocationData): void {
    this.config.currency = currencyForCountry(location.countryCode);
  }

  // Must be json: any here since we are accepting raw file content that might not be a valid config
  private validateJSON(json: any): void {
    if (json.currency !== "USD" && json.currency !== "EUR" && json.currency !== "GBP") {
      throw new Error("currency must be a string");
    }
    if (typeof json.randomDivisor !== "number") {
      throw new Error("randomDivisor must be a number");
    }
  }

  public setConfig(file_content: string): void {
    try {
      const json = JSON.parse(file_content);
      this.validateJSON(json)
      // JSON is valid, set the config
      this.config = json;
    } catch (e) {
      console.error(e);
      return;
    }
  }

  private setMode(owed: number): void {
    this.mode = "normal";
    const is_random = owed % this.config.randomDivisor === 0;
    if (is_random) {
      this.mode = "random";
    }
  }

  // Written by Claude
  // The prompt I used is in prompt_history.txt
  // I haven't written Regex in a while, so this was the fastest way to get the job done,
  // Tested with test requirement x.x
  private pluralize(name: string): string {
    // Case 1: word ends in a consonant + "y" (e.g. "penny" to "pennies")
     // Regex breakdown: [^aeiou]y$ matches a "y" preceded by any non-vowel character, at the end of the string
    if (/[^aeiou]y$/i.test(name)) {
      // Drop the trailing "y" and append "ies"
      return name.slice(0, -1) + "ies";
    }
    // Case 2: word ends in s, x, z, ch, or sh (e.g. "bus", "church"),
    // "buzz"-like z endings, "church" to "churches", "dish" to "dishes")
    // These endings need "es" rather than just "s" so the plural is pronounceable
    if (/(s|x|z|ch|sh)$/i.test(name)) {
      return name + "es";
    }
    // All other cases just append "s"
    return name + "s";
  }

  public processFileContent(file_content: string): ChangeResult[]{
    const return_values: ChangeResult[] = [];
    if (!file_content) {
      const key = crypto.randomUUID();
      return_values.push({ mode: this.mode, value: undefined, error: "No file content provided", key})
      return return_values;
    }

    const lines = file_content.split("\n");
    for (const line of lines) {
      const [owed, paid] = line.split(",").map(Number);
      if (owed && paid) {
        const change_summary = this.calculateChange(owed, paid);
        return_values.push(change_summary);
      } else {
        if (line.length < 1) {
          continue;
        }
        const key = crypto.randomUUID();
        return_values.push({ mode: this.mode, value: undefined, error: "Invalid line format", key});
      }
    }
    return return_values;
  }

  public calculateChange(owed: number, paid: number): ChangeResult {
    const owedCents = Math.round(owed * 100);
    const paidCents = Math.round(paid * 100);
    const key = crypto.randomUUID();

    this.setMode(owedCents);
    const changeCents = paidCents - owedCents;
    let remainingCents = changeCents;
    const denominations = currency.CURRENCY_DENOMINATIONS[this.config.currency];
    const counts = new Map<string, number>(denominations.map(denomination => [denomination.name, 0]));

    if (paidCents < owedCents) {
      return { mode: this.mode, value: undefined, error: "Paid amount is less than owed amount", key};
    }

    if (this.mode === "random") {
      while (remainingCents > 0) {
        // See what denominations of currency are still eligible for change
        // Then pick a random one from the still eligible ones
        const still_eligible = denominations.filter(d => d.value <= remainingCents);
        const pick = still_eligible[Math.floor(Math.random() * still_eligible.length)];
        if (!pick) {
          const error = {mode: this.mode, value: undefined, error: "No eligible denominations remaining", key}
          return error;
        }

        counts.set(pick.name, (counts.get(pick.name) ?? 0) + 1);
        remainingCents -= pick.value;
      }
    } else {
      for (const denomination of denominations) {
        const count = Math.floor(remainingCents/ denomination.value);
        if (count > 0) {
          counts.set(denomination.name, count);
          remainingCents -= count * denomination.value;
        }
      }
    }
    const summary = this.generateSummary(counts);
    return { mode: this.mode, value: summary, error: undefined, key};
  }
  private generateSummary(counts: Map<string, number>): string {
    const summary = [];
    for (const [denomination, count] of counts) {
      if (count > 0) {
        let name = denomination;
        if (count > 1) {
          name = this.pluralize(name);
        }
        summary.push(`${count} ${name}`);
      }
    }
    return summary.join(",");
  }
}
