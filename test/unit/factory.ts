import sinon from 'sinon';
import PQueue from 'p-queue';
import { AppProps } from '../../source/App.js';

export function createAppProps(overrides: Partial<AppProps> = {}): AppProps {
    const deleteQueue = new PQueue({ autoStart: false });
    return {
        gitlabUrl: 'https://gitlab.my-domain.io',
        projectIds: [42],
        accessToken: 'yBo4v',
        days: 30,
        startDate: new Date(),
        exit: sinon.fake(),
        listPipelines: sinon.fake.resolves([]),
        filterPipelinesByDate: sinon.fake.returns([]),
        deletePipeline: sinon.fake.resolves(undefined),
        deleteQueue,
        showStackTraces: false,
        ...overrides,
    };
}
