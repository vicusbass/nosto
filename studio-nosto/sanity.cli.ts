import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  studioHost: 'nosto-official',
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
    dataset: 'production',
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
