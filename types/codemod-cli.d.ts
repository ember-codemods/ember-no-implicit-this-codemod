declare module 'codemod-cli' {
  export function getOptions(): unknown;
  export function runTransform(
    root: string,
    transformName: string,
    args: string[],
    type: 'hbs' | 'js'
  ): unknown;
  export function runTransformTest(options: Record<string, unknown>): unknown;
}
