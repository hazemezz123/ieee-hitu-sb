import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { eventSchema } from './schemas/event';

export default defineConfig({
  name: 'ieee-hitu-sb',
  title: 'IEEE HITU Student Branch',
  projectId: '4agihomt',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: [eventSchema],
  },
});
