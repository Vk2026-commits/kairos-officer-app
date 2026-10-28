import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function BankNumbers({
  applicationId,
  password,
}: {
  applicationId: string;
  password: string;
}) {
  const [numbers, setNumbers] = useState<{ routingNumber: string; accountNumber: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!numbers) return;
    const timer = window.setTimeout(() => setNumbers(null), 30000);
    const hide = () => setNumbers(null);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [numbers]);
  const reveal = async () => {
    if (numbers) {
      setNumbers(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.functions.invoke("get-applications", {
        body: { password, action: "reveal", applicationId },
      });
      if (error || data?.error) throw new Error("Unable to reveal bank numbers.");
      if (document.visibilityState === "visible" && document.hasFocus()) setNumbers(data);
    } catch {
      setError("Unable to reveal bank numbers. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="md:col-span-2 space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-muted-foreground block text-xs">Routing Number</span>
          <span className="font-mono">
            {numbers ? numbers.routingNumber || "Not provided" : "••••••••"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Account Number</span>
          <span className="font-mono">
            {numbers ? numbers.accountNumber || "Not provided" : "••••••••"}
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={reveal}
        aria-expanded={!!numbers}
      >
        {loading ? "Loading..." : numbers ? "Hide numbers" : "Reveal numbers"}
      </Button>
      {numbers && (
        <p className="text-xs text-muted-foreground">
          Numbers hide automatically after 30 seconds.
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
