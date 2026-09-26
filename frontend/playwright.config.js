import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', timeout: 60000, workers: 1, fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:5173', viewport: { width: 1440, height: 1000 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: process.env.CI ? [
    { command: 'npm run dev', url: 'http://127.0.0.1:5173', timeout: 60000 },
    { command: 'java -jar ../backend/target/pelisdark-api-2.0.0.jar --spring.profiles.active=preview', url: 'http://127.0.0.1:8080/api/health', timeout: 90000 },
    { command: 'python -m streamlit run ../chatbot/app.py --server.address 127.0.0.1 --server.headless true --browser.gatherUsageStats false', url: 'http://127.0.0.1:8501', timeout: 60000 },
  ] : undefined,
});
