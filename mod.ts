type Args<F> = F extends (...args: infer T) => unknown ? T : unknown;

/**
 * The response returned from the `/query` endpoint of the Pacuare API.
 */
export type QueryResponse = {
  columns: string[];
  values: unknown[][];
};

/**
 * A client for the Pacuare API.
 */
export class Client {
  /**
   * Create an API client.
   * @param apiKey Your Pacuare API key.
   * @param baseUrl The base URL of the API.
   */
  constructor(
    private apiKey: string,
    private baseUrl: string = "https://api.pacuare.dev/v1",
  ) {}

  /**
   * Call an API endpoint, passing any arguments on to an authenticated `fetch` call.
   * @param param0 The path of the API endpoint to call.
   */
  async call<T>(...[path, opts]: Args<typeof fetch>): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      ...opts,
      headers: {
        ...((opts && 'headers' in opts && opts['headers']) ? opts.headers : {}), 
        Authorization: `Bearer ${this.apiKey}`
      },
      credentials: "include",
    });
    if (!res.ok) throw res;
    return await res.json() as T;
  }

  /**
   * Query the Pacuare database.
   * @param query The SQL query to send.
   * @param params The parameters to send. Note that this uses Psycopg3 query syntax, so parameters are denoted with %s.
   * @returns The query response, if successful.
   */
  query(query: string, params: unknown[]): Promise<QueryResponse> {
    return this.call<QueryResponse>("/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, params }),
    });
  }
}
