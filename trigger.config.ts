import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // Your project ref from the Trigger.dev dashboard
  project: "proj_quoojnxmnqjckgtvuxgi",

  // Directories containing your tasks
  dirs: ["./src/trigger"],

  // Retry configuration
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },

  // Max duration of a task in seconds
  maxDuration: 3600,
});

