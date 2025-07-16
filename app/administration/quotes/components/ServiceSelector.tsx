"use client";

import type { Service, Product } from "@prisma/client";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

interface ServiceSelectorProps {
  services: Service[];
  products: Product[];
  onAddItem: (item: { designation: string; quantity: string; unitPrice: string; }) => void;
}

export function ServiceSelector({ services, products, onAddItem }: ServiceSelectorProps) {
  const [selectedType, setSelectedType] = useState<"service" | "product">("service");
  const [selectedId, setSelectedId] = useState("");

  const handleAdd = () => {
    if (!selectedId) return;

    if (selectedType === "service") {
      const service = services.find(s => s.id === selectedId);
      if (service) {
        onAddItem({
          designation: service.name,
          quantity: "1",
          unitPrice: "0",
        });
      }
    } else {
      const product = products.find(p => p.id === selectedId);
      if (product) {
        onAddItem({
          designation: product.designation,
          quantity: "1",
          unitPrice: String(product.pu_ht),
        });
      }
    }
    setSelectedId("");
  };

  const options = selectedType === "service" ? services : products;

  return (
    <div className="flex items-end gap-2 p-3 border rounded-lg dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
      <div className="flex-shrink-0">
        <label className="block text-xs font-medium text-gray-500 dark:text-dark-subtle">Type</label>
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value as "service" | "product");
            setSelectedId("");
          }}
          className="p-2 border rounded bg-white dark:bg-dark-background dark:border-dark-border"
        >
          <option value="service">Service</option>
          <option value="product">Produit</option>
        </select>
      </div>
      <div className="flex-grow">
        <label className="block text-xs font-medium text-gray-500 dark:text-dark-subtle">Sélectionner</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full p-2 border rounded bg-white dark:bg-dark-background dark:border-dark-border"
        >
          <option value="">-- Choisir un {selectedType === "service" ? "service" : "produit"} --</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {/* CORRECTION: Assertion de type pour guider TypeScript */}
              {selectedType === "service" ? (opt as Service).name : (opt as Product).designation}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!selectedId}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <PlusCircle size={16} />
        Ajouter
      </button>
    </div>
  );
}