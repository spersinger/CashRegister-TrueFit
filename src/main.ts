import { ChangeProcessor } from "./ChangeProcessor";

const changeProcessor = new ChangeProcessor();
const result = changeProcessor.processFileContent("2.0,3.0\n1.9,3.4\n3.33,8.0");
for (const item of result) {
  if (item.error) {
    console.log(item.error);
    continue;
  }
  console.log(item.value);
}
