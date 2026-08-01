import { readFile } from "node:fs/promises";
const input = JSON.parse(await readFile(process.argv[2], "utf8"));
const rows = Array.isArray(input) ? input : [input];
const normalized = rows.map((row, index) => ({ index, ...row }));
process.stdout.write(JSON.stringify(normalized, null, 2) + "\n");
