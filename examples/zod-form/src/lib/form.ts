import type { ZodObject, ZodType } from 'zod'
import { writable, get } from 'svelte/store';


/**
 * Svelte input change event.
 */
type ChangeEvent = Event & {
  currentTarget: EventTarget & HTMLInputElement; 
}

/**
 * overwrite any mutual properties in Old with corresponding ones in New 
 */
export type Overwrite<Old, New> = Pick<Old, Exclude<keyof Old, keyof New>> & New

/**
 * helper interface for explode and collapse
 */
export type Entry = { key: any, value: any, optional: boolean };

/** 
 * helper for flatten
 */
export type Explode<T, TObj> =
    T extends TObj ? 
      { key: "", value: T, optional: false } : 
      { 
        [K in keyof T]: 
          K extends string ? 
            Explode<T[K], TObj> extends infer E ? 
              E extends Entry ?
                {
                    key: `${K}${E['key']}`,
                    value: E['value'],
                    optional: E['key'] extends "" ? {} extends Pick<T, K> ? true : false : E['optional']
                } : 
                never : 
              never : 
            never
      }[keyof T] 

/**
 * helper for flatten
 */
export type Collapse<T extends Entry> = (
    { 
      [E in Extract<T, { optional: false }> as E['key']]: E['value'] 
    } 
    & 
    Partial<
    { 
      [E in Extract<T, { optional: true }> as E['key']]: E['value'] 
    }
    >
  ) extends infer O ? { [K in keyof O]: O[K] } : never

/** 
 * flattens an object
 * @see {@link https://stackoverflow.com/questions/69095054/how-to-deep-flatten-a-typescript-interface-with-union-types-and-keep-the-full-ob}
 */
export type Flatten<T, TObj> = Collapse<Explode<T, TObj>>

let test = {
  a: {
    b: {
      c: {
        d: true
      },
      e: false
    },
    f: 123
  },
  g: 'asdf'
}

type Test = Flatten<typeof test, boolean | number | string>

let x: Test = {
  abcd: true,
  abe: false,
  af: 123,
  g: 'asdf'
}

x.abe


/**
 * Options
 */
type Options<T> = {
  initialValues?: T | Promise<T>
  schema?: ZodObject<{[k in keyof T]: ZodType}>
}

/**
 * Error
 */
type FormError = {
  node: HTMLElement
  error: Error
}

export function createForm<T>(options?: Options<T>) {
  let initialValues = 
    options?.initialValues instanceof Promise ? undefined : options?.initialValues

  if (options?.initialValues instanceof Promise) {
    options.initialValues.then((values) => {
      initialValues = values
      data.set(values)
    })
  } 

  const data = writable<T>(initialValues)
  const errors = writable<FormError[]>([])

  /**
   * Register a form
   */
  const form = (node: HTMLElement) => {
    const handleSubmit = (e: Event) => {
      e.preventDefault()
      const err = get(errors)
      if (err?.[0]) return err[0].node.scrollIntoView()
    }

    node.addEventListener('submit', handleSubmit)

    return {
      destroy() {
        node.removeEventListener('submit', handleSubmit)
      }
    }
  }

  /**
   * Register a field
   */
  const field = (node: HTMLElement, name: keyof T) => {
    const handleChange = (event: Event) => {
      const value = (event as ChangeEvent).currentTarget.value
      try {
        const parsedValue = options?.schema?.shape[name].parse(value)
        data.update((f) => ({ ...f, [name]: parsedValue }))
      } catch (error) {
        if (error instanceof Error) {
          errors.update(e => [...e, { node, error: error as Error }])
        }
      }
    }

    node.addEventListener('change', handleChange)

    return {
      destroy() {
        node.removeEventListener('change', handleChange)
      },
    }
  }

  return { form, data, errors, field }
}

