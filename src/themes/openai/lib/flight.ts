// Published React Flight wire format. Preserve untouched records verbatim;
// recompute UTF-8 lengths when a text record changes. No runtime UI rewrite.
export interface FlightRow { id: string; raw: string; kind: 'json' | 'text' | 'other'; value?: any; }
export const PUSH = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
export function readFlight(html: string): FlightRow[] {
  const stream = [...html.matchAll(PUSH)].map(m => JSON.parse(m[1])).join('');
  const bytes = Buffer.from(stream); const rows: FlightRow[] = [];
  let offset = 0;
  while (offset < bytes.length) {
    const start = offset, colon = bytes.indexOf(58, offset);
    if (colon < 0) throw new Error('Incomplete Flight record.');
    const id = bytes.subarray(offset, colon).toString();
    if (!/^[a-f0-9]*$/i.test(id)) throw new Error('Invalid Flight id: ' + id);
    offset = colon + 1;
    const text = /^T([a-f0-9]+),/i.exec(bytes.subarray(offset, offset + 25).toString());
    if (text) {
      const from = offset + text[0].length, end = from + parseInt(text[1], 16);
      if (end > bytes.length) throw new Error('Incomplete Flight text.');
      offset = end + (bytes[end] === 10 ? 1 : 0);
      rows.push({ id, kind: 'text', value: bytes.subarray(from, end).toString(), raw: bytes.subarray(start, offset).toString() });
      continue;
    }
    const newline = bytes.indexOf(10, offset), end = newline < 0 ? bytes.length : newline;
    const value = bytes.subarray(offset, end).toString(); offset = end + 1;
    const raw = bytes.subarray(start, Math.min(offset, bytes.length)).toString();
    try { rows.push({ id, raw, kind: 'json', value: JSON.parse(value) }); }
    catch { rows.push({ id, raw, kind: 'other' }); }
  }
  return rows;
}
export function rewriteFlight(html: string, change: (value: any) => any, imports = ''): string {
  let changed = !!imports;
  const stream = readFlight(html).map(row => {
    if (row.kind === 'other') return row.raw;
    const before = JSON.stringify(row.value), after = change(row.value);
    if (JSON.stringify(after) === before) return row.raw;
    changed = true;
    return row.kind === 'text'
      ? `${row.id}:T${Buffer.byteLength(after).toString(16)},${after}`
      : `${row.id}:${JSON.stringify(after)}\n`;
  }).join('') + imports;
  if (!changed) return html;
  let first = true;
  return html.replace(PUSH, () => {
    const text = first ? stream : ''; first = false;
    return `self.__next_f.push([1,${JSON.stringify(text).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')}])`;
  });
}
