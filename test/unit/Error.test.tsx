import sinon from 'sinon';
import { assert } from 'chai';
import { render } from 'ink-testing-library';
import { Error, ErrorProps } from '../../src/Error';

function renderError(text: string, overrides: Partial<ErrorProps> = {}) {
  const props: ErrorProps = {
    exit: sinon.fake(),
    ...overrides,
  };
  return render(<Error exit={props.exit}>{text}</Error>);
}

suite('<Error />', function () {
  test('renders a red error message', function () {
    const { lastFrame } = renderError('Test error');
    const actual = lastFrame();
    const expected = '\u001b[31mTest error\u001b[39m';
    assert.strictEqual(actual, expected);
  });

  test('calls given exit() callback after it was rendered', function () {
    const exit = sinon.fake();
    const { unmount } = renderError('Test error', { exit });
    unmount();
    sinon.assert.calledOnce(exit);
  });
});
