"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onOpenChange, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out" />
        <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
          <Dialog.Content
            className={cn(
              "pointer-events-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-md border bg-card text-card-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
              className,
            )}
          >
            {children}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export const ModalTitle = Dialog.Title
export const ModalDescription = Dialog.Description
export const ModalClose = Dialog.Close
