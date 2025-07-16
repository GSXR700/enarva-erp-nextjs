// app/administration/leads/[leadId]/components/LeadHeader.tsx
"use client";
import Link from "next/link";
import { Lead } from "@prisma/client";
import { Edit, Trash, ArrowRight, ChevronLeft } from "lucide-react";

// Un composant bouton simple pour rester cohérent
const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary' | 'outline' | 'destructive'}) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium h-10 py-2 px-4 transition-colors disabled:opacity-50";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300 dark:border-dark-border bg-transparent hover:bg-gray-100 dark:hover:bg-dark-border",
        destructive: "bg-red-600 text-white hover:bg-red-700"
    }
    return <button className={`${baseClasses} ${variants[props.variant || 'primary']}`} {...props}>{children}</button>
}

export const LeadHeader = ({ lead }: { lead: Lead }) => {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
            <div>
                <Link href="/administration/leads" className="flex items-center text-sm text-gray-500 dark:text-dark-subtle mb-2 hover:underline">
                    <ChevronLeft className="h-4 w-4 mr-1"/>
                    Retour à la liste des prospects
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{lead.nom}</h1>
                <p className="text-sm text-gray-500 dark:text-dark-subtle">Prospect de type {lead.type} - via {lead.canal}</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <Link href={`/administration/leads/${lead.id}/edit`}>
                     <Button variant="outline"><Edit className="mr-2 h-4 w-4"/> Modifier</Button>
                </Link>
                <Button variant="destructive"><Trash className="mr-2 h-4 w-4"/> Supprimer</Button>
                <Button variant="primary"><ArrowRight className="mr-2 h-4 w-4"/> Convertir</Button>
            </div>
        </div>
    );
}