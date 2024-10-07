import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  e2e: {
    // Increase default command and page load timeouts
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,

    // Disable chrome web security if necessary
    chromeWebSecurity: false,

    // Setup the retries for failed tests
    retries: {
      runMode: 2,
      openMode: 1,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      config.env = config.env || {};
      // you could extract only specific variables and rename them if necessary
      config.env.FRONTEND_URL = process.env.FRONTEND_URL;
      config.env.BACKEND_URL = process.env.BACKEND_URL;
      console.log("Extended config.env with process.env");
      return config;
    },
  },
});
