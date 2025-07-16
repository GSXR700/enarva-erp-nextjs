import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
try {
const session = await getServerSession(authOptions);
if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
return new NextResponse("Accès non autorisé", { status: 403 });
}

const body = await req.json();
const { nom, telephone, email, canal, statut, type, source, commentaire, assignedToId } = body;

if (!nom) {
  return new NextResponse("Le nom du prospect est requis", { status: 400 });
}

const newLead = await prisma.lead.create({
  data: {
    nom,
    telephone,
    email,
    canal,
    statut,
    type,
    source,
    commentaire,
    assignedToId,
  },
});

return NextResponse.json(newLead, { status: 201 });
} catch (error) {
console.error("[LEADS_POST_ERROR]", error);
return new NextResponse("Erreur Interne du Serveur", { status: 500 });
}
}

export async function GET(req: Request) {
try {
const session = await getServerSession(authOptions);
if (!session?.user) {
return new NextResponse("Accès non autorisé", { status: 401 });
}

const leads = await prisma.lead.findMany({
  orderBy: {
    date_creation: 'desc',
  },
  include: {
    assignedTo: {
      select: {
        name: true,
        image: true,
      }
    },
  }
});

return NextResponse.json(leads);
} catch (error) {
console.error("[LEADS_GET_ERROR]", error);
return new NextResponse("Erreur Interne du Serveur", { status: 500 });
}
}







