/**
 * HTTP request methods defined by MDN.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods}
 */
export type mdnHttpRequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE'

/**
 * Allow custom HTTP request methods.
 */
export type HttpRequestMethod = mdnHttpRequestMethod | string & {}

/**
 * Special properties of the router.
 */
export type RouterProps = '__schema__'

export type AnyRouterMethod = RouterProps | string & {}

export type Procedure = {
  [key in HttpRequestMethod]?: () => string
}

export type Router = {
  [k in AnyRouterMethod]?: Router | Procedure
}

export let x: Router = {
  a: {
    b: {
      HEAD() {
        return 'hello'
      }
    }
  }
}
