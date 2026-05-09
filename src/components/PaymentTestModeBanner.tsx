import { getPaddleEnvironment } from "@/lib/paddle";

function isPreviewEnvironment() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host.endsWith(".lovableproject.com") ||
    host.includes("id-preview--") ||
    host.endsWith("-dev.lovable.app")
  );
}

export function PaymentTestModeBanner() {
  if (getPaddleEnvironment() !== "sandbox") return null;
  if (!isPreviewEnvironment()) return null;

  return (
    <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-xs sm:text-sm text-orange-800">
      All payments made in the preview are in test mode.{" "}
      <a
        href="https://docs.lovable.dev/features/payments#test-and-live-environments"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-medium"
      >
        Read more
      </a>
    </div>
  );
}
