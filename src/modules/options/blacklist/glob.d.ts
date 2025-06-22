interface Glob {
  match: (pattern: string, string: string) => boolean;
}
declare const glob: Glob;
export default glob;
