// hooks/use-modal-store.ts
"use client";

import { create } from 'zustand';
import { Lead } from '@prisma/client';

export type ModalType = "deleteLead" | "convertLead";

interface ModalData {
  lead?: Lead;
  title?: string;
  description?: string;
  onConfirm?: () => Promise<void>;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false }),
}));