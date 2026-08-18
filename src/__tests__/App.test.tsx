import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

const mockRequestLocation = vi.fn();

vi.mock("../hooks/useGeolocation", () => ({
  default: () => ({
    location: null,
    error: null,
    loading: false,
    permissionState: "granted" as PermissionState,
    requestLocation: mockRequestLocation,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(crypto, "randomUUID").mockReturnValue(
    "00000000-0000-0000-0000-000000000001" as `${string}-${string}-${string}-${string}-${string}`
  );
});

function getFileInput(name: string): HTMLInputElement {
  const span = screen.getByText(name);
  const label = span.closest("label");
  if (!label) throw new Error(`No label found containing "${name}"`);
  const input = label.querySelector('input[type="file"]') as HTMLInputElement;
  if (!input) throw new Error(`No file input found in label containing "${name}"`);
  return input;
}

describe("App — README behaviors", () => {
  describe("initial rendering", () => {
    it('renders the heading "Cash Register"', () => {
      render(<App />);
      expect(screen.getByRole("heading", { name: /cash register/i })).toBeInTheDocument();
    });

    it("renders Amount Owed and Amount Paid inputs with defaults", () => {
      render(<App />);
      expect(screen.getByLabelText(/amount owed/i)).toHaveValue("2.12");
      expect(screen.getByLabelText(/amount paid/i)).toHaveValue("3.00");
    });

    it("renders a Calculate button", () => {
      render(<App />);
      expect(screen.getByRole("button", { name: /calculate/i })).toBeInTheDocument();
    });

    it("shows placeholder text when no results exist", () => {
      render(<App />);
      expect(
        screen.getByText(/upload a file or calculate a single transaction/i)
      ).toBeInTheDocument();
    });

    it("shows neither loading nor location status when loading=false and location=null", () => {
      render(<App />);
      expect(
        screen.queryByText(/loading location for local currency/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/using location for local currency/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("manual single-transaction calculation", () => {
    it("clicking Calculate with defaults shows README sample output", async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByRole("button", { name: /calculate/i }));
      expect(screen.getByText("3 quarters,1 dime,3 pennies")).toBeInTheDocument();
    });

    it("changing inputs and calculating reflects new values", async () => {
      const user = userEvent.setup();
      render(<App />);

      const owedInput = screen.getByLabelText(/amount owed/i);
      const paidInput = screen.getByLabelText(/amount paid/i);

      await user.clear(owedInput);
      await user.type(owedInput, "1.97");
      await user.clear(paidInput);
      await user.type(paidInput, "2.00");

      await user.click(screen.getByRole("button", { name: /calculate/i }));
      expect(screen.getByText("3 pennies")).toBeInTheDocument();
    });

    it("calculating with non-numeric input does not crash or show results", async () => {
      const user = userEvent.setup();
      render(<App />);

      const owedInput = screen.getByLabelText(/amount owed/i);
      await user.clear(owedInput);
      await user.type(owedInput, "abc");

      await user.click(screen.getByRole("button", { name: /calculate/i }));
      expect(
        screen.getByText(/upload a file or calculate a single transaction/i)
      ).toBeInTheDocument();
    });

    it("shows Download Results button after successful calculation", async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByRole("button", { name: /calculate/i }));
      expect(
        screen.getByRole("button", { name: /download results/i })
      ).toBeInTheDocument();
    });
  });

  describe("file upload and processing", () => {
    it('renders "Upload File" button', () => {
      render(<App />);
      expect(screen.getByText("Upload File")).toBeInTheDocument();
    });

    it("shows file name after upload", async () => {
      const user = userEvent.setup();
      render(<App />);

      const fileInput = getFileInput("Upload File");
      const file = new File(["2.12,3.00"], "test.txt", { type: "text/plain" });
      await user.upload(fileInput, file);

      expect(screen.getByText("test.txt")).toBeInTheDocument();
    });

    it("Process File button appears after file upload", async () => {
      const user = userEvent.setup();
      render(<App />);

      const fileInput = getFileInput("Upload File");
      const file = new File(["2.12,3.00"], "test.txt", { type: "text/plain" });
      await user.upload(fileInput, file);

      expect(
        screen.getByRole("button", { name: /process file/i })
      ).toBeInTheDocument();
    });

    it("processing a multi-line file shows multiple results", async () => {
      const user = userEvent.setup();
      render(<App />);

      const fileInput = getFileInput("Upload File");
      const file = new File(
        ["2.12,3.00\n1.97,2.00"],
        "test.txt",
        { type: "text/plain" }
      );
      await user.upload(fileInput, file);
      await user.click(screen.getByRole("button", { name: /process file/i }));

      expect(screen.getByText("3 quarters,1 dime,3 pennies")).toBeInTheDocument();
      expect(screen.getByText("3 pennies")).toBeInTheDocument();
    });

    it("processing README sample input shows README sample output", async () => {
      const user = userEvent.setup();
      render(<App />);

      const fileInput = getFileInput("Upload File");
      const file = new File(
        ["2.12,3.00\n1.97,2.00\n3.33,5.00"],
        "sample.txt",
        { type: "text/plain" }
      );
      await user.upload(fileInput, file);
      await user.click(screen.getByRole("button", { name: /process file/i }));

      expect(screen.getByText("3 quarters,1 dime,3 pennies")).toBeInTheDocument();
      expect(screen.getByText("3 pennies")).toBeInTheDocument();
      expect(screen.getByText("Random change generated")).toBeInTheDocument();
    });

    it("processing file with mixed valid/invalid lines shows errors for bad lines", async () => {
      const user = userEvent.setup();
      render(<App />);

      const fileInput = getFileInput("Upload File");
      const file = new File(
        ["2.12,3.00\nbadline\n1.97,2.00"],
        "mixed.txt",
        { type: "text/plain" }
      );
      await user.upload(fileInput, file);
      await user.click(screen.getByRole("button", { name: /process file/i }));

      expect(screen.getByText("3 quarters,1 dime,3 pennies")).toBeInTheDocument();
      expect(screen.getByText("3 pennies")).toBeInTheDocument();
      expect(
        screen.getByText(/Error: Invalid line format/)
      ).toBeInTheDocument();
    });
  });

  describe("download results", () => {
    it("Download button appears after successful calculation", async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByRole("button", { name: /calculate/i }));
      expect(
        screen.getByRole("button", { name: /download results/i })
      ).toBeInTheDocument();
    });

    it("Download button does NOT appear when results have errors", async () => {
      const user = userEvent.setup();
      render(<App />);

      const fileInput = getFileInput("Upload File");
      const file = new File(["badline"], "bad.txt", { type: "text/plain" });
      await user.upload(fileInput, file);
      await user.click(screen.getByRole("button", { name: /process file/i }));

      expect(
        screen.queryByRole("button", { name: /download results/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("config upload", () => {
    it('renders "Upload config" button', () => {
      render(<App />);
      expect(screen.getByText("Upload config")).toBeInTheDocument();
    });

    it("shows 'Default config loaded' initially", () => {
      render(<App />);
      expect(screen.getByText("Default config loaded")).toBeInTheDocument();
    });

    it("shows 'Config loaded' after uploading valid config", async () => {
      const user = userEvent.setup();
      render(<App />);

      const configInput = getFileInput("Upload config");
      const configFile = new File(
        [JSON.stringify({ currency: "USD", randomDivisor: 3 })],
        "config.json",
        { type: "application/json" }
      );
      await user.upload(configInput, configFile);

      expect(screen.getByText("Config loaded")).toBeInTheDocument();
    });

    it("shows error after uploading invalid config", async () => {
      const user = userEvent.setup();
      render(<App />);

      const configInput = getFileInput("Upload config");
      const badConfig = new File(["not json"], "bad.json", {
        type: "application/json",
      });
      await user.upload(configInput, badConfig);

      expect(screen.getByText(/Config Error/)).toBeInTheDocument();
    });
  });
});
