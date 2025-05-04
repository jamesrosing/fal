"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "rounded-md shadow-md",
        duration: 4000,
      }}
    />
  );
} 