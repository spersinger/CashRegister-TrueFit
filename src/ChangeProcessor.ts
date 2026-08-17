import * as currency from "./types/Currency.ts"

export interface config_t {
  currency: "USD" | "EUR" | "GBP";
  random_divisor: number;
}

export interface change_result_t {
  mode: "normal" | "random";
  value: string | undefined;
  error: string | undefined;
}

export class ChangeProcessor {
  private config: config_t;
  private mode: "normal" | "random";

  constructor() {
    this.mode = "normal";
    this.config = { currency: "USD", random_divisor: 3 };
  }

  public read_config(file_content: string): void {
    this.config = JSON.parse(file_content);
    console.log(this.config);
  }

  private set_mode(owed: number): void {
    this.mode = "normal";
    const is_random = owed % this.config.random_divisor === 0;
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

  public process_file_content(file_content: string): change_result_t[]{
    let return_values: change_result_t[] = [];
    if (!file_content) {
      return_values.push({ mode: this.mode, value: undefined, error: "No file content provided"})
      return return_values;
    }

    const lines = file_content.split("\n");
    for (const line of lines) {
      const [owed, paid] = line.split(",").map(Number);
      if (owed && paid) {
        const change_summary = this.calculate_change(owed, paid);
        return_values.push(change_summary);
      } else {
        return_values.push({ mode: this.mode, value: undefined, error: "Invalid line format"});
      }
    }
    return return_values;
  }

  public calculate_change(owed: number, paid: number): change_result_t {
    const owedCents = Math.round(owed * 100);
    const paidCents = Math.round(paid * 100);

    this.set_mode(owedCents);
    const changeCents = paidCents - owedCents;
    let remainingCents = changeCents;
    const denominations = currency.CURRENCY_DENOMINATIONS[this.config.currency];
    const counts = new Map<string, number>(denominations.map(denomination => [denomination.name, 0]));

    if (this.mode === "random") {
      while (remainingCents > 0) {
        // See what denominations of currency are still eligible for change
        // Then pick a random one from the still eligible ones
        const still_eligible = denominations.filter(d => d.value <= remainingCents);
        const pick = still_eligible[Math.floor(Math.random() * still_eligible.length)];
        if (!pick) {
          return { mode: this.mode, value: undefined, error: "No eligible denominations remaining"};
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
    const summary = this.generate_summary(counts);
    return { mode: this.mode, value: summary, error: undefined};
  }
  private generate_summary(counts: Map<string, number>): string {
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
