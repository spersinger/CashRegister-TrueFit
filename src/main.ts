import ChangeProcessor from "./ChangeProcessor";

const changeProcessor = new ChangeProcessor();
const result = changeProcessor.load_file("2.0,3.0\n1.9,3.4")
for (const item of result) {
  if (item.error) {
    console.log(item.error);
    continue;
  }
  console.log(item.value);
}
