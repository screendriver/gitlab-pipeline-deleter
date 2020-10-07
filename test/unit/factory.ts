import sinon from 'sinon';
import { AppProps } from '../../src/App';

export function createAppProps(overrides: Partial<AppProps> = {}): AppProps {
  return {
    gitlabUrl: 'https://gitlab.my-domain.io',
    projectId: 42,
    accessToken: 'yBo4v',
    days: 30,
    startDate: new Date(),
    exit: sinon.fake(),
    listPipelines: sinon.fake.resolves([]),
    filterPipelinesByDate: sinon.fake.returns([]),
    deletePipeline: sinon.fake.resolves(undefined),
    showStackTraces: false,
    ...overrides,
  };
}
