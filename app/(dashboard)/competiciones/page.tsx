"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ESTADO_COMPETICION } from "@/lib/i18n/es";
import { useAppData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";
import { competitionLabel } from "@/lib/utils/stats";

export default function CompeticionesPage() {
  const data = useAppData();
  const { isAdmin } = useAuth();

  const typeColors = {
    liga: "cyan" as const,
    eliminatoria_directa: "pink" as const,
    ida_vuelta: "purple" as const,
    grupos_eliminatoria: "green" as const,
  };

  return (
    <div>
      <PageHeader
        title="Competiciones"
        description="Formatos con calendario generado automáticamente al inscribir equipos."
        action={
          isAdmin ? (
            <Button href="/admin/competiciones">+ Crear competición</Button>
          ) : undefined
        }
      />

      {data.competitions.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-zinc-400">No hay competiciones creadas.</p>
            {isAdmin && (
              <Button href="/admin/competiciones" className="mt-4">
                Crear la primera
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {data.competitions.map((c) => (
            <Link key={c.id} href={`/competiciones/${c.id}`}>
              <Card className="h-full transition-all hover:border-violet-500/30">
                <CardBody>
                  <div className="mb-3 flex items-center justify-between">
                    <Badge color={typeColors[c.type]}>
                      {competitionLabel(c.type)}
                    </Badge>
                    <Badge color={c.status === "active" ? "green" : "zinc"}>
                      {ESTADO_COMPETICION[c.status]}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold">{c.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{c.season}</p>
                  <p className="mt-4 text-xs text-violet-400">
                    {c.clubIds.length} equipos · Ver calendario →
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
