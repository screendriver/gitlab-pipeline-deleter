import got, { Headers } from 'got';

export interface Pipeline {
    readonly id: number | string;
    readonly updated_at: string;
}

export type GetRequest = (url: string, accessToken: string) => Promise<Pipeline[]>;

export type DeleteRequest = (url: string, accessToken: string) => Promise<string>;

function createHeaders(accessToken: string): Headers {
    return { 'PRIVATE-TOKEN': accessToken };
}

export const getRequest: GetRequest = (url, accessToken) => {
    return got.paginate.all<Pipeline>(url, {
        headers: createHeaders(accessToken),
    });
};

export const deleteRequest: DeleteRequest = (url, accessToken) => {
    return got
        .delete(url, {
            headers: createHeaders(accessToken),
            throwHttpErrors: true,
            retry: {
                limit: 0,
            },
        })
        .text();
};
