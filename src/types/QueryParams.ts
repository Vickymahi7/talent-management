export default interface QueryParams {
  q: string;
  "q.op"?: string;
  rows?: string;
  start?: string;
  fq?: string;
  sort?: string;
}
