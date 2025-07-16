// enarva-nextjs-app/app/administration/products/page.tsx
import prisma from "@/lib/prisma";
import { AddProductButton } from "./components/AddProductButton";
import { ProductList } from "./components/ProductList";
import { PaginationControls } from "../components/PaginationControls";

interface ProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = Number(searchParams["page"]) || 1;
  const itemsPerPage = Number(searchParams["per_page"]) || 10;
  const skip = (page - 1) * itemsPerPage;

  const [products, totalProducts] = await prisma.$transaction([
    prisma.product.findMany({
      orderBy: {
        designation: "asc",
      },
      skip: skip,
      take: itemsPerPage,
    }),
    prisma.product.count(),
  ]);

  const hasNextPage = (page * itemsPerPage) < totalProducts;
  const hasPrevPage = page > 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Gestion des Produits & Services
        </h1>
        <AddProductButton />
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <ProductList products={products} />
        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalProducts}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}