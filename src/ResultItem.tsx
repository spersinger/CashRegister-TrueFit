import type { ChangeResult } from "./ChangeProcessor";

interface ResultItemProps {
  result: ChangeResult;
}

const ResultItem = ({ result }: ResultItemProps) => {
  return (
    <div>
      {result.error !== undefined && <p className="note">Error: {result.error}</p>}
      {result.mode === "random" && result.error === undefined && <p className="note">Random change generated</p>}
      <p>{result.value}</p>
    </div>
  );
};

export default ResultItem;
