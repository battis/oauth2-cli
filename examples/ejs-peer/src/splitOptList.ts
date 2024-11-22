export function splitOptList(
  delimiter: string,
  optList?: string[] | string
): Record<string, string> {
  const regex = new RegExp(`^([^${delimiter}]+)${delimiter}(.*)$`);
  if (typeof optList === 'string') {
    optList = [optList];
  }
  return (optList || []).reduce((obj: Record<string, string>, raw: string) => {
    const [, parameter, value] = (raw.match(regex) || [])?.map((p) => p.trim());
    if (parameter && value) {
      obj[parameter] = value;
    }
    return obj;
  }, {});
}
