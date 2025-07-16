// app/administration/settings/components/ProfilePhotoUploader.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useEdgeStore } from "@/lib/edgestore";
import { UserAvatar } from "../../components/UserAvatar";
import { updateProfilePicture } from "../actions";
import { Camera, Loader2 } from "lucide-react";

export function ProfilePhotoUploader() {
  const { data: session, update } = useSession();
  const { edgestore } = useEdgeStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (file) {
      setIsUploading(true);
      try {
        const res = await edgestore.publicFiles.upload({ file });
        
        // Mettre à jour la base de données avec la nouvelle URL
        await updateProfilePicture(res.url);

        // Mettre à jour la session NextAuth pour refléter le changement instantanément
        await update({ image: res.url });

      } catch (error) {
        console.error("Upload failed:", error);
        alert("L'upload a échoué.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <UserAvatar src={session?.user?.image} name={session?.user?.name} size={80} />
          <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition-colors">
            <Camera size={16} />
            <input
              id="avatar-upload"
              type="file"
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleUpload(e.target.files[0]);
                }
              }}
              disabled={isUploading}
            />
          </label>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="animate-spin text-white" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg dark:text-white">Photo de Profil</h3>
          <p className="text-sm text-gray-500 dark:text-dark-subtle mt-1">Cliquez sur l'icône pour changer votre avatar.</p>
        </div>
      </div>
    </div>
  );
}