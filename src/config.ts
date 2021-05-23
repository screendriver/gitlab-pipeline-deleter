import type { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';

const baseConfigSchema = z.object({
  gitlabUrl: z.string().url(),
  accessToken: z.string(),
  days: z.number(),
  trace: z.boolean(),
});

const configSchema = baseConfigSchema.extend({
  projectIds: z.array(z.number().positive()).nonempty(),
});

const configInputSchema = baseConfigSchema.extend({ projectId: z.string() });

const partialConfigInputSchema = configInputSchema.partial();

export type Config = z.infer<typeof configSchema>;
export type PartialConfigInput = z.infer<typeof partialConfigInputSchema>;

export async function loadConfig(
  filePath: string,
  explorer: ReturnType<typeof cosmiconfig>,
): Promise<PartialConfigInput | undefined> {
  try {
    const loaded = await explorer.load(filePath);
    if (loaded?.isEmpty) {
      return undefined;
    }
    return partialConfigInputSchema.parse(loaded?.config);
  } catch {
    return undefined;
  }
}

function convertToNumber(value: string): number {
  return parseInt(value, 10);
}

function commaSeparatedStringToNumberArray(commaSeparatedString: string): readonly number[] {
  return commaSeparatedString.split(',').map(convertToNumber);
}

export function mergeCliArgumentsWithConfig(
  cliArguments?: PartialConfigInput,
  config?: PartialConfigInput,
): ReturnType<typeof configSchema.safeParse> {
  const configInput = configInputSchema.safeParse({
    gitlabUrl: cliArguments?.gitlabUrl ?? config?.gitlabUrl,
    projectId: cliArguments?.projectId ?? config?.projectId,
    accessToken: cliArguments?.accessToken ?? config?.accessToken,
    days: cliArguments?.days ?? config?.days,
    trace: cliArguments?.trace ?? config?.trace,
  });

  if (!configInput.success) {
    return configInput;
  }

  return configSchema.safeParse({
    gitlabUrl: configInput.data.gitlabUrl,
    projectIds: commaSeparatedStringToNumberArray(configInput.data.projectId),
    accessToken: configInput.data.accessToken,
    days: configInput.data.days,
    trace: configInput.data.trace,
  });
}
