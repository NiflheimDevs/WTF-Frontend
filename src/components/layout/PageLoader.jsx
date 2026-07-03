import { Spinner } from "../primitives/Spinner";

export function PageLoader() {
  return (
    <div className="animate-fade-in">
      <Spinner size="lg" fullScreen={false} />
    </div>
  );
}
