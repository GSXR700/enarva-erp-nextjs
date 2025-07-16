// app/api/edgestore/[...edge_store]/route.ts
import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

const es = initEdgeStore.create();

/**
 * C'est le backend public d'Edge Store.
 */
const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket(),
  // Nous pourrons ajouter des "buckets" plus spécifiques plus tard,
  // par exemple pour les observations des missions.
  observations: es.imageBucket({
      maxSize: 1024 * 1024 * 5, // 5MB
  }),
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };

/**
 * Ce type est utilisé pour lier le backend au frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;