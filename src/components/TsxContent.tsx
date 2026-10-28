import { tsxComponents } from "../generated/tsx-registry";
export default function TsxContent({ id }: { id: string }) {
  const Component = tsxComponents[id];
  if (!Component) throw Error("Unknown TSX article: " + id);
  return <Component />;
}
