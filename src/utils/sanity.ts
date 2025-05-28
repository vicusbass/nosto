import { createClient } from "@sanity/client";

const projectId = "v7l03s9k";
const dataset = "production";
const apiVersion = "2024-05-01";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: import.meta.env.PROD,
});
