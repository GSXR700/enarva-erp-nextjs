// providers/modal-provider.tsx
"use client";

import { useEffect, useState } from "react";
import { DeleteLeadModal } from "@/app/administration/leads/components/DeleteLeadModal"; 
import { ConvertLeadModal } from "@/app/administration/leads/components/modals/ConvertLeadModal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <DeleteLeadModal /> 
      <ConvertLeadModal />
    </>
  );
};