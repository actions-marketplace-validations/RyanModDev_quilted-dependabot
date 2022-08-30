import { bold, green, red } from "https://deno.land/std@0.153.0/fmt/colors.ts";

export const success = (a: string) => {
  console.log(bold(green("✔")) + " " + a);
};

export const error = (a: string) => {
  console.log(bold(red("✘")) + " " + a);
};
