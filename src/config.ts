import type { cosmiconfig } from 'cosmiconfig';
import { Result } from 'true-myth';
import is from '@sindresorhus/is';
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

const partialConfigInputSchema = configInputSchema.strict().partial();

export type Config = z.infer<typeof configSchema>;
export type PartialConfigInput = z.infer<typeof partialConfigInputSchema>;

type ConfigError = 'config-invalid' | 'unknown';

export async function loadConfig(
    filePath: string,
    explorer: ReturnType<typeof cosmiconfig>,
): Promise<Result<PartialConfigInput, ConfigError>> {
    try {
        const loaded = await explorer.load(filePath);

        if (loaded?.isEmpty) {
            return Result.ok({});
        }

        const parsedConfig = partialConfigInputSchema.safeParse(loaded?.config);

        if (parsedConfig.success) {
            return Result.ok(parsedConfig.data);
        }

        return Result.err('config-invalid');
    } catch (error: unknown) {
        if (is.error(error)) {
            return Result.ok({});
        }

        return Result.err('unknown');
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
): Result<Config, ConfigError> {
    const configInput = configInputSchema.safeParse({
        gitlabUrl: cliArguments?.gitlabUrl ?? config?.gitlabUrl,
        projectId: cliArguments?.projectId ?? config?.projectId,
        accessToken: cliArguments?.accessToken ?? config?.accessToken,
        days: cliArguments?.days ?? config?.days,
        trace: cliArguments?.trace ?? config?.trace,
    });

    if (!configInput.success) {
        return Result.err('config-invalid');
    }

    const parsedConfigSchema = configSchema.safeParse({
        gitlabUrl: configInput.data.gitlabUrl,
        projectIds: commaSeparatedStringToNumberArray(configInput.data.projectId),
        accessToken: configInput.data.accessToken,
        days: configInput.data.days,
        trace: configInput.data.trace,
    });

    if (!parsedConfigSchema.success) {
        return Result.err('config-invalid');
    }

    return Result.ok(parsedConfigSchema.data);
}
