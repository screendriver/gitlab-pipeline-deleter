import type { cosmiconfig } from 'cosmiconfig';
import * as z from 'zod';

const configSchema = z
  .object({
    gitlabUrl: z.string().url(),
    projectId: z.number(),
    accessToken: z.string(),
    days: z.number(),
    trace: z.boolean(),
  })
  .partial();

export type Config = z.infer<typeof configSchema>;

export async function loadConfig(
  filePath: string,
  explorer: ReturnType<typeof cosmiconfig>,
): Promise<Config | undefined> {
  try {
    const loaded = await explorer.load(filePath);
    if (loaded?.isEmpty) {
      return undefined;
    }
    return configSchema.parse(loaded?.config);
  } catch {
    return undefined;
  }
}
