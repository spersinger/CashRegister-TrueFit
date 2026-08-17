import type { change_result_t } from "./ChangeProcessor";

interface ResultItemProps {
  result: change_result_t;
}

const ResultItem = ({ result }: ResultItemProps) => {
  return (
    <div>
      {result.error !== undefined && <p className="note">Error: {result.error}</p>}
      {result.mode === "random" && <p className="note">Random change generated</p>}
      <p>{result.value}</p>
    </div>
  );
}

export default ResultItem;
