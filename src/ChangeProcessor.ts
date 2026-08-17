import * as currency from "./types/Currency.ts"

interface config_t {
  currency: "USD" | "EUR" | "GBP";
  random_divisor: number;
}

interface change_result_t {
  mode: "normal" | "random";
  value: string | undefined;
  error: string | undefined;
}

class ChangeProcessor {
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

  public load_file(file_content: string): change_result_t[]{
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
      // TODO: generate random change
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
        summary.push(`${count} ${denomination}`);
      }
    }
    return summary.join(",");
  }


}

export default ChangeProcessor;
