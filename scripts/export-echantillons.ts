import { VALENCIA } from "./echantillons";
import { writeFileSync } from "fs";
writeFileSync("/home/z/my-project/scripts/feature-src/import-v4/valencia.txt", VALENCIA, "utf-8");
console.log("OK", VALENCIA.length, "caractères");
