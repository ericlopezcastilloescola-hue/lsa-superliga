"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PromptDialog } from "@/components/ui/prompt-dialog";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
};

export type PromptOptions = {
  title?: string;
  message?: string;
  label?: string;
  defaultValue?: string;
  inputType?: "text" | "date" | "datetime-local";
  confirmLabel?: string;
  cancelLabel?: string;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

type PendingPrompt = PromptOptions & {
  resolve: (value: string | null) => void;
};

type DialogContextValue = {
  askConfirm: (options: ConfirmOptions | string) => Promise<boolean>;
  askPrompt: (options: PromptOptions | string) => Promise<string | null>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(
    null,
  );
  const [pendingPrompt, setPendingPrompt] = useState<PendingPrompt | null>(
    null,
  );

  const askConfirm = useCallback((options: ConfirmOptions | string) => {
    return new Promise<boolean>((resolve) => {
      const opts =
        typeof options === "string" ? { message: options } : options;
      setPendingConfirm({ ...opts, resolve });
    });
  }, []);

  const askPrompt = useCallback((options: PromptOptions | string) => {
    return new Promise<string | null>((resolve) => {
      const opts =
        typeof options === "string"
          ? { label: options, defaultValue: "" }
          : options;
      setPendingPrompt({ ...opts, resolve });
    });
  }, []);

  function closeConfirm(result: boolean) {
    pendingConfirm?.resolve(result);
    setPendingConfirm(null);
  }

  function closePrompt(result: string | null) {
    pendingPrompt?.resolve(result);
    setPendingPrompt(null);
  }

  return (
    <DialogContext.Provider value={{ askConfirm, askPrompt }}>
      {children}
      <ConfirmDialog
        open={pendingConfirm !== null}
        title={pendingConfirm?.title}
        message={pendingConfirm?.message ?? ""}
        confirmLabel={pendingConfirm?.confirmLabel}
        cancelLabel={pendingConfirm?.cancelLabel}
        variant={pendingConfirm?.variant}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
      <PromptDialog
        open={pendingPrompt !== null}
        title={pendingPrompt?.title}
        message={pendingPrompt?.message}
        label={pendingPrompt?.label}
        defaultValue={pendingPrompt?.defaultValue}
        inputType={pendingPrompt?.inputType}
        confirmLabel={pendingPrompt?.confirmLabel}
        cancelLabel={pendingPrompt?.cancelLabel}
        onConfirm={(value) => closePrompt(value.trim() || null)}
        onCancel={() => closePrompt(null)}
      />
    </DialogContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useConfirm debe usarse dentro de ConfirmProvider");
  }
  return ctx;
}
