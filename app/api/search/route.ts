// app/api/search/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const [clients, quotes, invoices, orders, deliveryNotes] = await Promise.all([
      // Recherche des clients par nom
      prisma.client.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 5,
      }),
      // Recherche des devis par numéro
      prisma.quote.findMany({
        where: { quoteNumber: { contains: query, mode: 'insensitive' } },
        take: 5,
      }),
      // Recherche des factures par numéro
      prisma.invoice.findMany({
        where: { invoiceNumber: { contains: query, mode: 'insensitive' } },
        take: 5,
      }),
       // Recherche des commandes par numéro ou ref. externe
       prisma.order.findMany({
        where: { 
            OR: [
                { orderNumber: { contains: query, mode: 'insensitive' } },
                { refCommande: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 5,
      }),
      // Recherche des BL par numéro
      prisma.deliveryNote.findMany({
        where: { deliveryNoteNumber: { contains: query, mode: 'insensitive' } },
        take: 5,
      }),
    ]);

    // Formater les résultats pour l'affichage
    const results = {
      clients: clients.map(c => ({ id: c.id, title: c.name, type: 'Client' })),
      quotes: quotes.map(q => ({ id: q.id, title: q.quoteNumber, type: 'Devis' })),
      invoices: invoices.map(i => ({ id: i.id, title: i.invoiceNumber, type: 'Facture' })),
      orders: orders.map(o => ({ id: o.id, title: o.orderNumber, type: 'Commande' })),
      deliveryNotes: deliveryNotes.map(dn => ({ id: dn.id, title: dn.deliveryNoteNumber, type: 'BL' })),
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}