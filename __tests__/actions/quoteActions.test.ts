import { getNextQuoteNumber, saveQuote } from '../../app/administration/quotes/actions';
import prisma from '../../lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// On simule (mock) les modules externes
jest.mock('../../lib/prisma', () => ({
  quote: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation(async (callback) => {
    const mockTx = {
      quote: {
        update: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockResolvedValue({}),
      },
       prestation: {
        deleteMany: jest.fn().mockResolvedValue({}),
      }
    };
    await callback(mockTx);
  }),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('getNextQuoteNumber', () => {

  beforeEach(() => {
    (prisma.quote.findFirst as jest.Mock).mockClear();
  });

  it('should return the initial quote number if no quotes exist', async () => {
    (prisma.quote.findFirst as jest.Mock).mockResolvedValue(null);
    const year = new Date().getFullYear();
    const result = await getNextQuoteNumber();
    expect(result).toBe(`DV-100/${year}`);
  });

  it('should increment correctly from the last quote number', async () => {
    const year = new Date().getFullYear();
    (prisma.quote.findFirst as jest.Mock).mockResolvedValue({
      quoteNumber: `DV-150/${year}`,
      createdAt: new Date(),
    });
    const result = await getNextQuoteNumber();
    expect(result).toBe(`DV-151/${year}`);
  });
});

describe('saveQuote', () => {

  beforeEach(() => {
    (prisma.quote.create as jest.Mock).mockClear();
    // CORRECTION DÉFINITIVE : On utilise un cast vers `unknown` pour satisfaire TypeScript
    (redirect as unknown as jest.Mock).mockClear();
    (revalidatePath as jest.Mock).mockClear();
  });

  it('should create a new quote and redirect', async () => {
    const formData = new FormData();
    formData.append('clientId', 'client-123');
    formData.append('date', '2025-07-12');
    formData.append('object', 'Test Devis');
    formData.append('status', 'SENT');
    formData.append('items', JSON.stringify([{ designation: 'Service 1', quantity: '2', unitPrice: '50', total: 100 }]));
    formData.append('personnelMobilise', '2 agents');
    formData.append('equipementsUtilises', 'Produits standards');
    formData.append('prestationsIncluses', 'Nettoyage sols');
    formData.append('delaiPrevu', '2 heures');

    (prisma.quote.create as jest.Mock).mockResolvedValue({ id: 'quote-456' });

    await saveQuote(formData);

    expect(prisma.quote.create).toHaveBeenCalledTimes(1);

    expect(prisma.quote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalTTC: 120,
          status: 'SENT',
          object: 'Test Devis',
        }),
      })
    );

    expect(revalidatePath).toHaveBeenCalledWith('/administration/quotes');
    // On utilise le même cast ici
    expect(redirect as unknown as jest.Mock).toHaveBeenCalledWith('/administration/quotes');
  });
});