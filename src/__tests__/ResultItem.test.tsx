import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultItem from "../ResultItem.tsx";
import type { ChangeResult } from "../ChangeProcessor";

describe("ResultItem", () => {
  it("normal result shows the change value", () => {
    const result: ChangeResult = {
      mode: "normal",
      value: "3 quarters,1 dime,3 pennies",
      error: undefined,
      key: "1",
    };
    render(<ResultItem result={result} />);
    expect(screen.getByText("3 quarters,1 dime,3 pennies")).toBeInTheDocument();
  });

  it("random result shows 'Random change generated' note", () => {
    const result: ChangeResult = {
      mode: "random",
      value: "1 dollar,1 quarter,6 nickels,12 pennies",
      error: undefined,
      key: "1",
    };
    render(<ResultItem result={result} />);
    expect(screen.getByText("Random change generated")).toBeInTheDocument();
    expect(
      screen.getByText("1 dollar,1 quarter,6 nickels,12 pennies")
    ).toBeInTheDocument();
  });

  it("error result shows 'Error: {message}'", () => {
    const result: ChangeResult = {
      mode: "normal",
      value: undefined,
      error: "Paid amount is less than owed amount",
      key: "1",
    };
    render(<ResultItem result={result} />);
    expect(
      screen.getByText("Error: Paid amount is less than owed amount")
    ).toBeInTheDocument();
  });

  it("error result does not show a value", () => {
    const result: ChangeResult = {
      mode: "normal",
      value: undefined,
      error: "Some error",
      key: "1",
    };
    render(<ResultItem result={result} />);
    expect(screen.queryByText("undefined")).not.toBeInTheDocument();
  });

  it("normal successful result does not show random note", () => {
    const result: ChangeResult = {
      mode: "normal",
      value: "2 quarters",
      error: undefined,
      key: "1",
    };
    render(<ResultItem result={result} />);
    expect(
      screen.queryByText("Random change generated")
    ).not.toBeInTheDocument();
  });
});
