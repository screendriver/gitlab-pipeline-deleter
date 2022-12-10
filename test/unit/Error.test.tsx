import React from 'react';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import sinon from 'sinon';
import { render, cleanup } from 'ink-testing-library';
import { Error, ErrorProps } from '../../src/Error';

test.after.each(cleanup);

function renderError(text: string, overrides: Partial<ErrorProps> = {}) {
    const props: ErrorProps = {
        exit: sinon.fake(),
        ...overrides,
    };

    return render(
        <Error
            exit={() => {
                props.exit();
            }}
        >
            {text}
        </Error>,
    );
}

test('renders a red error message', () => {
    const { lastFrame } = renderError('Test error');
    const actual = lastFrame();
    const expected = '\u001b[31mTest error\u001b[39m';
    assert.equal(actual, expected);
});

test('calls given exit() callback after it was rendered', () => {
    const exit = sinon.fake();
    const { unmount } = renderError('Test error', { exit });
    unmount();
    sinon.assert.calledOnce(exit);
});

test.run();
