"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useAppData, useData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";

type Props = {
  clubId: string;
  /** Si true, solo muestra solicitudes (panel capitán). Si false, también muestra botón solicitar. */
  captainOnly?: boolean;
};

export function ClubJoinPanel({ clubId, captainOnly = false }: Props) {
  const data = useAppData();
  const { user, captainClubId } = useAuth();
  const { requestJoinClub, respondJoinRequest, refresh } = useData();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const club = data.clubs.find((c) => c.id === clubId);
  const isCaptain =
    captainClubId === clubId || (user?.role === "admin" && !captainOnly);

  const myPlayer = data.players.find((p) => p.id === user?.playerId);
  const isMember = myPlayer?.clubId === clubId;
  const hasPending = data.joinRequests.some(
    (jr) => jr.clubId === clubId && jr.userId === user?.id && jr.status === "pending",
  );

  const pendingForCaptain = data.joinRequests.filter(
    (jr) =>
      jr.clubId === clubId &&
      jr.status === "pending" &&
      jr.userId !== user?.id,
  );

  async function handleRequest() {
    setLoading(true);
    setMessage(null);
    try {
      await requestJoinClub(clubId);
      setMessage("Solicitud enviada. El capitán debe aceptarla.");
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al solicitar");
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(requestId: string, action: "accept" | "reject") {
    setLoading(true);
    try {
      await respondJoinRequest(requestId, action);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  if (captainOnly && !isCaptain) {
    return (
      <p className="text-sm text-zinc-500">No tienes permisos de capitán.</p>
    );
  }

  return (
    <div className="space-y-4">
      {!captainOnly && user && !isMember && !hasPending && !myPlayer?.clubId && (
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-zinc-400">
              ¿Quieres unirte a este equipo? Envía una solicitud al capitán.
            </p>
            <Button onClick={handleRequest} disabled={loading || !club?.captainId}>
              Solicitar unirse
            </Button>
            {!club?.captainId && (
              <p className="w-full text-xs text-amber-400">
                Este equipo aún no tiene capitán asignado.
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {!captainOnly && hasPending && (
        <Card>
          <CardBody>
            <p className="text-sm text-amber-400">
              Tienes una solicitud pendiente para este equipo.
            </p>
          </CardBody>
        </Card>
      )}

      {message && <p className="text-sm text-violet-300">{message}</p>}

      {isCaptain && captainOnly && pendingForCaptain.length > 0 && (
        <Card>
          <CardHeader
            title="Solicitudes pendientes"
            subtitle="Acepta o rechaza jugadores"
          />
          <CardBody className="space-y-3">
            {pendingForCaptain.map((jr) => (
              <div
                key={jr.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {jr.userGamertag ?? "Jugador"}
                  </p>
                  <p className="text-xs text-zinc-500">{jr.userEmail}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={loading}
                    onClick={() => handleRespond(jr.id, "accept")}
                  >
                    Aceptar
                  </Button>
                  <Button
                    variant="danger"
                    disabled={loading}
                    onClick={() => handleRespond(jr.id, "reject")}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {isCaptain && pendingForCaptain.length === 0 && captainOnly && (
        <p className="text-sm text-zinc-500">No hay solicitudes pendientes.</p>
      )}
    </div>
  );
}
