import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemas } from './src/sanity/schemas/index';

export default defineConfig({
  name: 'ieee-hitu-sb',
  title: 'IEEE HITU Student Branch',
  projectId: '4agihomt',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: schemas,
  },
});
