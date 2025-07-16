// lib/edgestore.ts
'use client';

import { type EdgeStoreRouter } from '../app/api/edgestore/[...edge_store]/route';
import { createEdgeStoreProvider } from '@edgestore/react';

const { EdgeStoreProvider, useEdgeStore } =
  createEdgeStoreProvider<EdgeStoreRouter>();

export { EdgeStoreProvider, useEdgeStore };