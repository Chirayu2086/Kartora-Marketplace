"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AddressSnapshot } from "@/types";

export interface StoredAddress extends AddressSnapshot {
  id: string;
  isDefault: boolean;
}

interface AddressState {
  addresses: StoredAddress[];
  save: (address: Omit<StoredAddress, "id"> & { id?: string }) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: [],
      save: (address) =>
        set((s) => {
          if (address.id) {
            return { addresses: s.addresses.map((a) => (a.id === address.id ? { ...a, ...address, id: a.id } : a)) };
          }
          const created: StoredAddress = { ...address, id: crypto.randomUUID() };
          const addresses = created.isDefault ? s.addresses.map((a) => ({ ...a, isDefault: false })) : s.addresses;
          return { addresses: [...addresses, created] };
        }),
      remove: (id) => set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
      setDefault: (id) => set((s) => ({ addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })) })),
    }),
    { name: "kartora-addresses" }
  )
);
