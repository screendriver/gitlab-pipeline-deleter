import test from 'ava';
import sinon from 'sinon';
import { render, cleanup } from 'ink-testing-library';
import { Error, ErrorProps } from '../../src/Error';

test.afterEach(cleanup);

function renderError(text: string, overrides: Partial<ErrorProps> = {}) {
  const props: ErrorProps = {
    exit: sinon.fake(),
    ...overrides,
  };
  return render(<Error exit={props.exit}>{text}</Error>);
}

test.serial('renders a red error message', (t) => {
  const { lastFrame } = renderError('Test error');
  const actual = lastFrame();
  const expected = '\u001b[31mTest error\u001b[39m';
  t.is(actual, expected);
});

test.serial('calls given exit() callback after it was rendered', (t) => {
  const exit = sinon.fake();
  const { unmount } = renderError('Test error', { exit });
  unmount();
  sinon.assert.calledOnce(exit);
  t.pass();
});
