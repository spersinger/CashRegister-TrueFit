import { describe, it, expect, beforeEach } from "vitest";
import { ChangeProcessor } from "../ChangeProcessor";

describe("ChangeProcessor", () => {
  let processor: ChangeProcessor;

  beforeEach(() => {
    processor = new ChangeProcessor();
  });

  // ─── Basic Change Calculation ───────────────────────────────────
  // README: "the app should return the minimum amount of physical change"

  describe("minimum change calculation (US)", () => {
    it("README sample: 2.12 owed, 3.00 paid → 3 quarters,1 dime,3 pennies", () => {
      const result = processor.calculateChange(2.12, 3.00);
      expect(result.error).toBeUndefined();
      expect(result.value).toBe("3 quarters,1 dime,3 pennies");
    });

    it("README sample: 1.97 owed, 2.00 paid → 3 pennies", () => {
      const result = processor.calculateChange(1.97, 2.00);
      expect(result.error).toBeUndefined();
      expect(result.value).toBe("3 pennies");
    });

    it("exact change returns empty summary with no error", () => {
      const result = processor.calculateChange(1.0, 1.0);
      expect(result.error).toBeUndefined();
      expect(result.value).toBe("");
    });

    it("1.49 owed, 2.00 paid → 2 quarters (51 cents, owed 149¢ not ÷3)", () => {
      const result = processor.calculateChange(1.49, 2.0);
      expect(result.error).toBeUndefined();
      expect(result.value).toBe("2 quarters,1 penny");
    });

    it("0.01 owed, 1.00 paid → correct breakdown for 99 cents", () => {
      const result = processor.calculateChange(0.01, 1.0);
      expect(result.error).toBeUndefined();
      expect(result.value).toBe("3 quarters,2 dimes,4 pennies");
    });

    it("5.00 owed, 10.00 paid → 1 five", () => {
      const result = processor.calculateChange(5.0, 10.0);
      expect(result.error).toBeUndefined();
      expect(result.value).toBe("1 five");
    });

    it("returns error when paid < owed", () => {
      const result = processor.calculateChange(5.0, 3.0);
      expect(result.value).toBeUndefined();
      expect(result.error).toBe("Paid amount is less than owed amount");
    });

    it("result has mode normal when owed cents not divisible by 3", () => {
      const result = processor.calculateChange(2.12, 3.0);
      expect(result.mode).toBe("normal");
    });
  });

  // ─── Random Mode ────────────────────────────────────────────────
  // README: "If the owed amount is divisible by 3, the app should
  //          randomly generate the change denominations
  //          (but the math still needs to be right)"

  describe("random mode (owed divisible by randomDivisor)", () => {
    it("README sample: 3.33 owed → mode is random (333 cents % 3 === 0)", () => {
      const result = processor.calculateChange(3.33, 5.0);
      expect(result.mode).toBe("random");
    });

    it("1.97 owed → mode is normal (197 cents % 3 !== 0)", () => {
      const result = processor.calculateChange(1.97, 2.0);
      expect(result.mode).toBe("normal");
    });

    it("1.50 owed → mode is random (150 cents % 3 === 0)", () => {
      const result = processor.calculateChange(1.5, 2.0);
      expect(result.mode).toBe("random");
    });

    it("random result total in cents equals exact change amount", () => {
      const result = processor.calculateChange(3.33, 5.0);
      expect(result.error).toBeUndefined();

      // Parse the summary to verify total equals 167 cents
      const totalCents = parseSummaryToCents(result.value!);
      expect(totalCents).toBe(167);
    });

    it("random result uses only valid US denominations", () => {
      const validValues = new Set([10000, 5000, 2000, 1000, 500, 100, 25, 10, 5, 1]);

      // Run multiple times to increase coverage of random paths
      for (let i = 0; i < 20; i++) {
        const result = processor.calculateChange(3.33, 5.0);
        expect(result.error).toBeUndefined();

        const denominations = parseSummaryToDenominations(result.value!);
        for (const denom of denominations) {
          expect(validValues.has(denom.value)).toBe(true);
        }
      }
    });

    it("1.02 owed, 2.00 paid → random mode (102 cents % 3 === 0)", () => {
      const result = processor.calculateChange(1.02, 2.0);
      expect(result.mode).toBe("random");
      expect(result.error).toBeUndefined();

      const totalCents = parseSummaryToCents(result.value!);
      expect(totalCents).toBe(98);
    });

    it("1.01 owed, 2.00 paid → normal mode (101 cents % 3 !== 0)", () => {
      const result = processor.calculateChange(1.01, 2.0);
      expect(result.mode).toBe("normal");
    });

    it("random mode with custom randomDivisor 5: 1.05 owed → random (105 % 5 === 0)", () => {
      processor.setConfig(
        JSON.stringify({ currency: "US", randomDivisor: 5 })
      );
      const result = processor.calculateChange(1.05, 2.0);
      expect(result.mode).toBe("random");
      expect(result.error).toBeUndefined();

      const totalCents = parseSummaryToCents(result.value!);
      expect(totalCents).toBe(95);
    });

    it("random mode with custom divisor: 1.03 owed NOT random when divisor is 5 (103 % 5 !== 0)", () => {
      processor.setConfig(
        JSON.stringify({ currency: "US", randomDivisor: 5 })
      );
      const result = processor.calculateChange(1.03, 2.0);
      expect(result.mode).toBe("normal");
    });
  });

  // ─── Config ─────────────────────────────────────────────────────
  // README: "What might happen if the client needs to change the
  //          random divisor?"

  describe("configuration", () => {
    it("default config is US with randomDivisor 3", () => {
      const result = processor.calculateChange(2.12, 3.0);
      expect(result.error).toBeUndefined();
      // US denominations produce the expected output
      expect(result.value).toBe("3 quarters,1 dime,3 pennies");
    });

    it("setConfig applies valid JSON config", () => {
      const error = processor.setConfig(
        JSON.stringify({ currency: "US", randomDivisor: 5 })
      );
      expect(error).toBeNull();
    });

    it("setConfig returns error string for invalid JSON", () => {
      const error = processor.setConfig("not json at all");
      expect(error).toBeTypeOf("string");
      expect(error).not.toBeNull();
    });

    it("setConfig returns error for missing currency field", () => {
      const error = processor.setConfig(
        JSON.stringify({ randomDivisor: 3 })
      );
      expect(error).toBeTypeOf("string");
    });

    it("setConfig returns error for missing randomDivisor field", () => {
      const error = processor.setConfig(
        JSON.stringify({ currency: "US" })
      );
      expect(error).toBeTypeOf("string");
    });

    it("setConfig returns error for unsupported currency", () => {
      const error = processor.setConfig(
        JSON.stringify({ currency: "XYZ", randomDivisor: 3 })
      );
      expect(error).toBeTypeOf("string");
    });

    it("setConfig returns error for randomDivisor of 0", () => {
      const error = processor.setConfig(
        JSON.stringify({ currency: "US", randomDivisor: 0 })
      );
      expect(error).toBeTypeOf("string");
    });

    it("setConfig returns error for non-numeric randomDivisor", () => {
      const error = processor.setConfig(
        JSON.stringify({ currency: "US", randomDivisor: "abc" })
      );
      expect(error).toBeTypeOf("string");
    });
  });

  // ─── Multi-Currency ─────────────────────────────────────────────
  // README: "What might happen if sales closes a new client in France?"

  describe("multi-currency support", () => {
    it("France (FR) → uses EUR denominations", () => {
      processor.setLocation({
        latitude: 48.8566,
        longitude: 2.3522,
        countryCode: "FR",
        countryName: "France",
      });

      const result = processor.calculateChange(2.12, 3.0);
      expect(result.error).toBeUndefined();
      // 88 cents in EUR = 50+20+10+5+2+1 = 88
      expect(result.value).toBe(
        "1 50 cent,1 20 cent,1 10 cent,1 5 cent,1 2 cent,1 1 cent"
      );
    });

    it("UK (GB) → uses GBP denominations", () => {
      processor.setLocation({
        latitude: 51.5074,
        longitude: -0.1278,
        countryCode: "GB",
        countryName: "United Kingdom",
      });

      const result = processor.calculateChange(2.12, 3.0);
      expect(result.error).toBeUndefined();
      // 88 pence in GBP = 50p + 20p + 10p + 5p + 2p + 1p
      expect(result.value).toBe(
        "1 50 pence,1 20 pence,1 10 pence,1 5 pence,1 2 pence,1 1 pence"
      );
    });

    it("US → uses US denominations", () => {
      processor.setLocation({
        latitude: 40.7128,
        longitude: -74.006,
        countryCode: "US",
        countryName: "United States",
      });

      const result = processor.calculateChange(2.12, 3.0);
      expect(result.error).toBeUndefined();
      expect(result.value).toBe("3 quarters,1 dime,3 pennies");
    });

    it("null country code → falls back to US", () => {
      processor.setLocation({
        latitude: 0,
        longitude: 0,
        countryCode: null,
        countryName: null,
      });

      const result = processor.calculateChange(2.12, 3.0);
      expect(result.error).toBeUndefined();
      expect(result.value).toBe("3 quarters,1 dime,3 pennies");
    });

    it("unknown country (JP) → falls back to US", () => {
      processor.setLocation({
        latitude: 35.6762,
        longitude: 139.6503,
        countryCode: "JP",
        countryName: "Japan",
      });

      const result = processor.calculateChange(2.12, 3.0);
      expect(result.error).toBeUndefined();
      expect(result.value).toBe("3 quarters,1 dime,3 pennies");
    });

    it("setLocation with null country code falls back to US (not throw)", () => {
      // currencyForCountry returns "US" for null, which is supported
      expect(() =>
        processor.setLocation({
          latitude: 0,
          longitude: 0,
          countryCode: null,
          countryName: null,
        })
      ).not.toThrow();
    });
  });

  // ─── File Processing ────────────────────────────────────────────
  // README: "Accept a flat file as input", "multiple lines",
  //         "each new line in the input file should be a new line
  //          in the output file"

  describe("file content processing", () => {
    it("single line → one result", () => {
      const results = processor.processFileContent("2.12,3.00");
      expect(results).toHaveLength(1);
      expect(results[0].value).toBe("3 quarters,1 dime,3 pennies");
      expect(results[0].error).toBeUndefined();
    });

    it("multiple lines → multiple results", () => {
      const results = processor.processFileContent("2.12,3.00\n1.97,2.00");
      expect(results).toHaveLength(2);
      expect(results[0].value).toBe("3 quarters,1 dime,3 pennies");
      expect(results[1].value).toBe("3 pennies");
    });

    it("README sample input produces README sample output", () => {
      const input = "2.12,3.00\n1.97,2.00\n3.33,5.00";
      const results = processor.processFileContent(input);
      expect(results).toHaveLength(3);

      // Line 1: normal mode
      expect(results[0].mode).toBe("normal");
      expect(results[0].value).toBe("3 quarters,1 dime,3 pennies");

      // Line 2: normal mode
      expect(results[1].mode).toBe("normal");
      expect(results[1].value).toBe("3 pennies");

      // Line 3: random mode (333 % 3 === 0)
      expect(results[2].mode).toBe("random");
      expect(results[2].error).toBeUndefined();
      const totalCents = parseSummaryToCents(results[2].value!);
      expect(totalCents).toBe(167);
    });

    it("README sample with blank lines between entries", () => {
      // README shows blank lines between entries. The current implementation
      // splits on \n and would process blank lines as invalid.
      // Per README, blank lines should be skipped.
      const input = "2.12,3.00\n\n1.97,2.00\n\n3.33,5.00";
      const results = processor.processFileContent(input);
      expect(results).toHaveLength(3);
      expect(results[0].value).toBe("3 quarters,1 dime,3 pennies");
      expect(results[1].value).toBe("3 pennies");
      expect(results[2].mode).toBe("random");
    });

    it("empty file content → error about no content", () => {
      const results = processor.processFileContent("");
      expect(results).toHaveLength(1);
      expect(results[0].error).toBe("No file content provided");
    });

    it("malformed line → error for that line", () => {
      const results = processor.processFileContent("garbage");
      expect(results).toHaveLength(1);
      expect(results[0].error).toBe(
        "Invalid line format, expected 'owed,paid'"
      );
    });

    it("blank lines are skipped silently", () => {
      const results = processor.processFileContent("\n\n\n");
      expect(results).toHaveLength(0);
    });

    it("each result has a unique key", () => {
      const results = processor.processFileContent("2.12,3.00\n1.97,2.00");
      const keys = results.map((r) => r.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it("mixed valid and invalid lines", () => {
      const results = processor.processFileContent(
        "2.12,3.00\nbadline\n1.97,2.00"
      );
      expect(results).toHaveLength(3);
      expect(results[0].error).toBeUndefined();
      expect(results[0].value).toBe("3 quarters,1 dime,3 pennies");
      expect(results[1].error).toBe(
        "Invalid line format, expected 'owed,paid'"
      );
      expect(results[2].error).toBeUndefined();
      expect(results[2].value).toBe("3 pennies");
    });
  });

  // ─── Output Format ──────────────────────────────────────────────
  // README: "1 dollar,2 quarters,1 nickel, etc ..."

  describe("output format", () => {
    it("singular denomination uses singular name", () => {
      const result = processor.calculateChange(1.0, 2.0);
      expect(result.error).toBeUndefined();
      expect(result.value).toBe("1 dollar");
    });

    it("plural denominations use plural names", () => {
      // 1.76 owed, 2.00 paid → 24 cents change (owedCents=176, 176%3=2, normal)
      // greedy: 2 dimes, 4 pennies
      const result = processor.calculateChange(1.76, 2.0);
      expect(result.error).toBeUndefined();
      expect(result.value).toContain("dimes");
      expect(result.value).toContain("pennies");
    });

    it("denomination groups are comma-separated with no spaces", () => {
      const result = processor.calculateChange(2.12, 3.0);
      expect(result.error).toBeUndefined();
      // README format: "1 dollar,2 quarters,1 nickel" — no space after comma
      expect(result.value).toBe("3 quarters,1 dime,3 pennies");
    });
  });
});

// ─── Test Helpers ──────────────────────────────────────────────

const US_DENOMINATIONS = [
  { name: "one hundred", value: 10000 },
  { name: "fifty", value: 5000 },
  { name: "twenty", value: 2000 },
  { name: "ten", value: 1000 },
  { name: "five", value: 500 },
  { name: "dollar", value: 100 },
  { name: "quarter", value: 25 },
  { name: "dime", value: 10 },
  { name: "nickel", value: 5 },
  { name: "penny", value: 1 },
];

function parseSummaryToCents(summary: string): number {
  let total = 0;
  for (const part of summary.split(",")) {
    const trimmed = part.trim();
    const spaceIdx = trimmed.indexOf(" ");
    if (spaceIdx === -1) continue;
    const count = parseInt(trimmed.slice(0, spaceIdx), 10);
    const denomName = trimmed.slice(spaceIdx + 1);
    const denom = US_DENOMINATIONS.find((d) => {
      const plural =
        d.value === 1
          ? "pennies"
          : d.name.endsWith("y")
            ? d.name.slice(0, -1) + "ies"
            : d.name + "s";
      return d.name === denomName || plural === denomName;
    });
    if (denom) {
      total += count * denom.value;
    }
  }
  return total;
}

function parseSummaryToDenominations(
  summary: string
): Array<{ name: string; value: number }> {
  const result: Array<{ name: string; value: number }> = [];
  for (const part of summary.split(",")) {
    const trimmed = part.trim();
    const spaceIdx = trimmed.indexOf(" ");
    if (spaceIdx === -1) continue;
    const count = parseInt(trimmed.slice(0, spaceIdx), 10);
    const denomName = trimmed.slice(spaceIdx + 1);
    const denom = US_DENOMINATIONS.find((d) => {
      const plural =
        d.value === 1
          ? "pennies"
          : d.name.endsWith("y")
            ? d.name.slice(0, -1) + "ies"
            : d.name + "s";
      return d.name === denomName || plural === denomName;
    });
    if (denom) {
      for (let i = 0; i < count; i++) {
        result.push(denom);
      }
    }
  }
  return result;
}
