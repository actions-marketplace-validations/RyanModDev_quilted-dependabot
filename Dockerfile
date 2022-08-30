FROM denoland/deno:1.25.0

COPY . .

ENTRYPOINT ["deno", "run", "--allow-all", "mod.ts"]
