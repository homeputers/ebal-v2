import type { paths } from './types';

type PathItem<TPath extends keyof paths> = paths[TPath];
type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';
type Operation<
  TPath extends keyof paths,
  TMethod extends HttpMethod & keyof PathItem<TPath>
> = NonNullable<PathItem<TPath>[TMethod]>;

// Extract response body for a path+method+status
export type ResponseOf<
  TPath extends keyof paths,
  TMethod extends HttpMethod & keyof PathItem<TPath>,
  TStatus extends keyof Operation<TPath, TMethod>['responses']
> = Operation<TPath, TMethod>['responses'][TStatus] extends {
  content: { 'application/json': infer T };
}
  ? T
  : never;

// Extract request body
export type RequestBodyOf<
  TPath extends keyof paths,
  TMethod extends HttpMethod & keyof PathItem<TPath>
> = Operation<TPath, TMethod>['requestBody'] extends {
  content: { 'application/json': infer T };
}
  ? T
  : never;

// Extract query params
export type QueryOf<
  TPath extends keyof paths,
  TMethod extends HttpMethod & keyof PathItem<TPath>
> = Operation<TPath, TMethod>['parameters'] extends { query?: infer T }
  ? T
  : never;

// Extract path params
export type PathParamsOf<
  TPath extends keyof paths,
  TMethod extends HttpMethod & keyof PathItem<TPath>
> = Operation<TPath, TMethod>['parameters'] extends { path: infer T }
  ? T
  : never;
