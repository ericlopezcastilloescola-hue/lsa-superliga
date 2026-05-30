import { Suspense } from "react";
import CompletarRegistroForm from "./completar-registro-form";

export default function CompletarRegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B0E14]">
          <p className="text-sm text-zinc-500">Cargando…</p>
        </div>
      }
    >
      <CompletarRegistroForm />
    </Suspense>
  );
}
