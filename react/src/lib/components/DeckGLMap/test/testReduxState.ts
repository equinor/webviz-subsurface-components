// eslint-disable-next-line @typescript-eslint/no-var-requires
const exampleData = require("../../../../demo/example-data/deckgl-map.json");

const recordData = exampleData[0];
const demoData = JSON.stringify(recordData, null, 2);
demoData as unknown as Record<string, unknown>; // trying to convert the string "demodata" to type Record<K,T>

//export const testState = demoData
console.log(typeof demoData); // but type is still 'string'

export const testState = {}; // exporting an empty object instead of 'demoData' because 'string' type is not acceptable in "./TestWrapper.tsx"
