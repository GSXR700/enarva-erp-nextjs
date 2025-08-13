// contenu du fichier


"use client";

import { useState, useEffect } from "react";
// CHANGEMENT: Import du nouveau type JuridicState
import type { Client, Quote, Product, Service, Prestation, JuridicState } from "@prisma/client";
import { saveQuote } from "../actions";
import Link from "next/link";
import { Trash2, Loader2, PlusCircle } from "lucide-react";
import { ServiceSelector } from "./ServiceSelector";

type QuoteItem = {
  designation: string;
  quantity: string;
  unitPrice: string;
  total: number;
};

// Le type complet inclut maintenant la relation vers Prestation
type FullQuote = Quote & { prestation: Prestation | null };

interface QuoteFormProps {
  clients: Client[];
  products: Product[];
  services: Service[];
  quote?: FullQuote;
}

export function QuoteForm({ clients, products, services, quote }: QuoteFormProps) {
  
  const formatForInput = (val: any) => (val === null || val === undefined) ? "" : String(val);

  const initialItems: QuoteItem[] = quote?.items 
    ? (quote.items as any[]).map(item => ({
        designation: item.designation || "",
        quantity: formatForInput(item.quantity),
        unitPrice: formatForInput(item.unitPrice),
        total: parseFloat(item.total || "0"),
      }))
    : [{ designation: "", quantity: "1", unitPrice: "0", total: 0 }];

  const [items, setItems] = useState<QuoteItem[]>(initialItems);
  const [totalHT, setTotalHT] = useState(quote?.totalHT || 0);
  const [totalTTC, setTotalTTC] = useState(quote?.totalTTC || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [currentItem, setCurrentItem] = useState<QuoteItem>({
    designation: "",
    quantity: "1",
    unitPrice: "0",
    total: 0
  });
  
  // CHANGEMENT: Ajout d'un état pour l'état juridique du devis
  const [juridicState, setJuridicState] = useState<JuridicState>(quote?.juridicState || 'LEGAL');

  const [object, setObject] = useState(quote?.object || '');
  const [personnel, setPersonnel] = useState(quote?.prestation?.personnelMobilise || '');
  const [equipements, setEquipements] = useState(quote?.prestation?.equipementsUtilises || '');
  const [prestationsIncluses, setPrestationsIncluses] = useState(quote?.prestation?.prestationsIncluses || '');
  const [delai, setDelai] = useState(quote?.prestation?.delaiPrevu || '');

  useEffect(() => {
    const newTotalHT = items.reduce((sum, item) => sum + (parseFloat(String(item.total)) || 0), 0);
    setTotalHT(newTotalHT);
    // CHANGEMENT: Le calcul du TTC dépend de l'état juridique
    if (juridicState === 'LEGAL') {
      setTotalTTC(newTotalHT * 1.20);
    } else {
      setTotalTTC(newTotalHT);
    }
  }, [items, juridicState]); // On ajoute juridicState aux dépendances

  const handleItemChange = (index: number, field: keyof QuoteItem, value: string) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };
    const qty = parseFloat(currentItem.quantity);
    const price = parseFloat(currentItem.unitPrice);
    if (!isNaN(qty) && !isNaN(price)) {
      currentItem.total = qty * price;
    }
    newItems[index] = currentItem;
    setItems(newItems);
  };

  const addItem = (item: QuoteItem | { designation: string; quantity: string; unitPrice: string; }) => {
    const qty = parseFloat(item.quantity);
    const price = parseFloat(item.unitPrice);
    const total = (!isNaN(qty) && !isNaN(price)) ? qty * price : 0;
    setItems([...items, { ...item, total }]);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount || 0);

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const qty = parseFloat(currentItem.quantity);
    const price = parseFloat(currentItem.unitPrice);
    const total = (!isNaN(qty) && !isNaN(price)) ? qty * price : 0;
    
    if (currentItem.designation.trim() === "") {
      alert("La désignation est requise");
      return;
    }

    addItem({ ...currentItem, total });
    setCurrentItem({
      designation: "",
      quantity: "1",
      unitPrice: "0",
      total: 0
    });
    setShowItemForm(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
    
    formData.set('status', submitter.value);
    formData.set('items', JSON.stringify(items));
    
    // CHANGEMENT: On ajoute l'état juridique au FormData
    formData.set('juridicState', juridicState);

    formData.set('personnelMobilise', personnel);
    formData.set('equipementsUtilises', equipements);
    formData.set('prestationsIncluses', prestationsIncluses);
    formData.set('delaiPrevu', delai);

    await saveQuote(formData);
    // Le `setIsSubmitting(false)` n'est pas nécessaire car la page redirige
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="id" value={quote?.id || ""} />
      
      {/* Tableau des éléments */}
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-container space-y-6">
        <div className="flex justify-between items-center border-b pb-3 dark:border-dark-border">
          <h3 className="text-lg font-semibold dark:text-dark-text">Éléments du devis</h3>
          <button
            type="button"
            onClick={() => setShowItemForm(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Ajouter un élément
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b dark:border-dark-border">
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Désignation</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-center">Quantité</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-right">Prix unitaire HT</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-right">Total HT</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-surface/50">
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={item.designation}
                      onChange={(e) => handleItemChange(index, 'designation', e.target.value)}
                      className="w-full p-1 border-b border-transparent hover:border-gray-300 dark:hover:border-dark-border bg-transparent focus:outline-none focus:border-primary dark:text-dark-text"
                      placeholder="Entrez la désignation"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-20 p-1 text-center border-b border-transparent hover:border-gray-300 dark:hover:border-dark-border bg-transparent focus:outline-none focus:border-primary dark:text-dark-text"
                      min="0"
                      step="1"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="w-32 p-1 text-right border-b border-transparent hover:border-gray-300 dark:hover:border-dark-border bg-transparent focus:outline-none focus:border-primary dark:text-dark-text"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="py-3 px-4 text-right font-medium dark:text-dark-text">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-dark-subtle">
                    Aucun élément dans le devis. Cliquez sur "Ajouter un élément" pour commencer.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t border-gray-200 dark:border-dark-border">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-right font-medium dark:text-dark-text">Total HT</td>
                <td className="py-3 px-4 text-right font-medium dark:text-dark-text">{formatCurrency(totalHT)}</td>
                <td></td>
              </tr>
              {juridicState === 'LEGAL' && (
                <>
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right font-medium dark:text-dark-text">TVA (20%)</td>
                    <td className="py-3 px-4 text-right font-medium dark:text-dark-text">{formatCurrency(totalHT * 0.2)}</td>
                    <td></td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-dark-border">
                    <td colSpan={3} className="py-3 px-4 text-right font-medium dark:text-dark-text">Total TTC</td>
                    <td className="py-3 px-4 text-right font-bold dark:text-dark-text">{formatCurrency(totalTTC)}</td>
                    <td></td>
                  </tr>
                </>
              )}
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal d'ajout d'élément */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-container rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-dark-text">
              Ajouter un élément
            </h3>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-subtle">
                  Désignation
                </label>
                <input
                  type="text"
                  value={currentItem.designation}
                  onChange={e => setCurrentItem({...currentItem, designation: e.target.value})}
                  className="mt-1 block w-full p-2 border rounded-md dark:bg-dark-background dark:border-dark-border dark:text-dark-text"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-subtle">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentItem.quantity}
                    onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})}
                    className="mt-1 block w-full p-2 border rounded-md dark:bg-dark-background dark:border-dark-border dark:text-dark-text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-subtle">
                    Prix unitaire HT
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentItem.unitPrice}
                    onChange={e => setCurrentItem({...currentItem, unitPrice: e.target.value})}
                    className="mt-1 block w-full p-2 border rounded-md dark:bg-dark-background dark:border-dark-border dark:text-dark-text"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowItemForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 dark:bg-dark-surface dark:text-dark-subtle dark:border-dark-border"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Informations Générales */}
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-container space-y-6">
        <h3 className="text-lg font-semibold dark:text-dark-text border-b pb-3 dark:border-dark-border">Informations Générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="clientId" className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-subtle">Client</label>
            <select id="clientId" name="clientId" defaultValue={quote?.clientId} required className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text">
              <option value="">Sélectionnez un client</option>
              {clients.map(client => <option key={client.id} value={client.id}>{client.nom}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-subtle">Date du devis</label>
            <input type="date" id="date" name="date" defaultValue={quote ? new Date(quote.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
          </div>
        </div>

        {/*
         * CHANGEMENT: Ajout du sélecteur pour l'état juridique
         */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-subtle">Régime fiscal</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="juridicState" 
                value="LEGAL" 
                checked={juridicState === 'LEGAL'} 
                onChange={() => setJuridicState('LEGAL')}
                className="form-radio h-4 w-4 text-primary focus:ring-primary-dark"
              />
              <span className="dark:text-dark-text">Légal (TVA applicable)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="juridicState" 
                value="BLACK" 
                checked={juridicState === 'BLACK'} 
                onChange={() => setJuridicState('BLACK')}
                className="form-radio h-4 w-4 text-primary focus:ring-primary-dark"
              />
              <span className="dark:text-dark-text">Facturation HT (TVA non applicable)</span>
            </label>
          </div>
        </div>

      </div>

      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-container space-y-6">
        <h3 className="text-lg font-semibold dark:text-dark-text border-b pb-3 dark:border-dark-border">Détails de la Prestation</h3>
        <div>
          <label htmlFor="object" className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-subtle">Objet du Devis</label>
          <input id="object" name="object" value={object} onChange={e => setObject(e.target.value)} placeholder="Ex: Nettoyage profond d'une Villa 3 niveaux" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
        </div>
        <div>
            <label htmlFor="personnelMobilise" className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-subtle">Personnel mobilisé</label>
            <textarea id="personnelMobilise" value={personnel} onChange={e => setPersonnel(e.target.value)} rows={3} placeholder="Ex: 1 cheffe d'équipe, 4 agents qualifiés" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
        </div>
         <div>
            <label htmlFor="equipementsUtilises" className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-subtle">Équipements et produits utilisés</label>
            <textarea id="equipementsUtilises" value={equipements} onChange={e => setEquipements(e.target.value)} rows={3} placeholder="Ex: Monobrosse, aspirateur à eau, produits certifiés..." className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
        </div>
         <div>
            <label htmlFor="prestationsIncluses" className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-subtle">Prestations incluses</label>
            <textarea id="prestationsIncluses" value={prestationsIncluses} onChange={e => setPrestationsIncluses(e.target.value)} rows={5} placeholder="Liste des tâches : dépoussiérage, lavage des vitres..." className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
        </div>
         <div>
            <label htmlFor="delaiPrevu" className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-subtle">Délai prévu de la prestation</label>
            <input id="delaiPrevu" value={delai} onChange={e => setDelai(e.target.value)} placeholder="Ex: 3 jours ouvrables" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-container">
        <h3 className="text-lg font-semibold mb-4 dark:text-dark-text">Lignes du Devis (Produits & Matériels)</h3>
        <div className="mb-4">
          <ServiceSelector services={services} products={products} onAddItem={addItem} />
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start p-2 rounded-md bg-gray-50 dark:bg-dark-surface">
              <div className="col-span-12 md:col-span-5"><input type="text" value={item.designation} onChange={e => handleItemChange(index, 'designation', e.target.value)} className="w-full p-2 border rounded dark:bg-dark-background dark:border-dark-border dark:text-dark-text" /></div>
              <div className="col-span-4 md:col-span-2"><input type="text" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full p-2 border rounded dark:bg-dark-background dark:border-dark-border dark:text-dark-text text-center" /></div>
              <div className="col-span-4 md:col-span-2"><input type="text" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} className="w-full p-2 border rounded dark:bg-dark-background dark:border-dark-border dark:text-dark-text text-right" /></div>
              <div className="col-span-4 md:col-span-2"><input type="text" value={item.total} readOnly onChange={e => handleItemChange(index, 'total', e.target.value)} className="w-full p-2 border rounded dark:bg-dark-background dark:border-dark-border font-bold dark:text-dark-text text-right" /></div>
              <div className="col-span-12 md:col-span-1 flex items-center justify-end h-full"><button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Trash2 size={16} /></button></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-6 md:flex-row md:justify-between">
        {/*
         * CHANGEMENT: L'affichage des totaux est maintenant conditionnel.
         */}
        <div className="w-full p-4 space-y-2 bg-gray-100 rounded-lg md:w-1/3 dark:bg-dark-surface">
            <div className="flex justify-between text-sm text-gray-600 dark:text-dark-subtle">
              <span>Total HT</span>
              <span>{formatCurrency(totalHT)}</span>
            </div>
            {juridicState === 'LEGAL' && (
              <>
                <div className="flex justify-between text-sm text-gray-600 dark:text-dark-subtle">
                  <span>TVA (20%)</span>
                  <span>{formatCurrency(totalHT * 0.2)}</span>
                </div>
                <div className="pt-2 mt-2 border-t flex justify-between font-bold text-lg text-gray-800 dark:text-dark-text dark:border-dark-border">
                  <span>Total TTC</span>
                  <span>{formatCurrency(totalTTC)}</span>
                </div>
              </>
            )}
        </div>
        <div className="flex gap-4">
            <Link href="/administration/quotes" className="px-6 py-2 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Annuler</Link>
            <button type="submit" name="status" value="DRAFT" disabled={isSubmitting} className="px-6 py-2 font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2">
                 {isSubmitting && <Loader2 className="animate-spin h-4 w-4"/>}
                Enregistrer Brouillon
            </button>
            <button type="submit" name="status" value="SENT" disabled={isSubmitting} className="px-6 py-2 font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                {isSubmitting && <Loader2 className="animate-spin h-4 w-4"/>}
                 Finaliser
            </button>
        </div>
      </div>
    </form>
  );
}