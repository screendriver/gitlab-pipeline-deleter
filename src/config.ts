import type { cosmiconfig } from 'cosmiconfig';
import * as z from 'zod';

const requiredArguments = z.object({
  gitlabUrl: z.string().url(),
  projectId: z.number(),
  accessToken: z.string(),
  days: z.number(),
  trace: z.boolean(),
});

const configSchema = requiredArguments.partial();

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

export type CliArguments = Config;

export function mergeCliArgumentsWithConfig(
  cliArguments?: CliArguments,
  config?: Config,
): ReturnType<typeof requiredArguments.safeParse> {
  return requiredArguments.safeParse({
    gitlabUrl: cliArguments?.gitlabUrl ?? config?.gitlabUrl,
    projectId: cliArguments?.projectId ?? config?.projectId,
    accessToken: cliArguments?.accessToken ?? config?.accessToken,
    days: cliArguments?.days ?? config?.days,
    trace: cliArguments?.trace ?? config?.trace,
  });
}
