import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  studioHost: 'nosto-official',
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
    dataset: 'production',
  },
  deployment: {
    autoUpdates: true,
  },
})
