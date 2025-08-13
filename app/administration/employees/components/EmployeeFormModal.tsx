// app/administration/employees/components/EmployeeFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role, Employee, PayRate, EmployeeType, Department } from "@prisma/client";
import { saveEmployee } from "../actions";
import { employeeFormSchema, EmployeeFormData } from "@/lib/validations"; // Import schema and type
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

type EmployeeWithUser = Employee & {
  user: {
    email: string | null;
    role: Role;
    departmentId: string | null;
  };
};

interface EmployeeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: EmployeeWithUser | null;
    payRates: PayRate[];
    departments: Department[];
}

export function EmployeeFormModal({ isOpen, onClose, employee, payRates, departments }: EmployeeFormModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
  });
  
  const contractType = watch("type");

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        reset({
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.user.email ?? "",
          phone: employee.phone ?? "",
          role: employee.user.role,
          type: employee.type,
          departmentId: employee.user.departmentId ?? "",
          defaultPayRateId: employee.defaultPayRateId ?? "",
          salaireDeBase: String(employee.salaireDeBase || ""),
          numeroCNSS: employee.numeroCNSS ?? "",
          numeroCIN: employee.numeroCIN ?? "",
        });
      } else {
        reset({
            role: Role.FIELD_WORKER,
            type: EmployeeType.JOURNALIER
        });
      }
    }
  }, [isOpen, employee, reset]);

  const processSubmit = async (data: EmployeeFormData) => {
    const result = await saveEmployee(data);
    if (result.success) {
      toast.success(employee ? "Employé mis à jour." : "Employé créé avec succès.");
      onClose();
    } else {
      toast.error(result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-3xl m-4 bg-white rounded-lg shadow-xl dark:bg-dark-container">
        <form onSubmit={handleSubmit(processSubmit)}>
          <div className="flex items-center justify-between p-4 border-b dark:border-dark-border">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">{employee ? "Modifier l'employé" : "Ajouter un employé"}</h3>
            <button type="button" onClick={onClose} className="text-3xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
          </div>
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <input type="hidden" {...register("id")} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Prénom</label>
                    <input id="firstName" {...register("firstName")} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border" />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                    <label htmlFor="lastName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Nom</label>
                    <input id="lastName" {...register("lastName")} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border" />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Email</label>
                    <input id="email" type="email" {...register("email")} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border" />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Téléphone</label>
                    <input id="phone" {...register("phone")} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Type de Contrat</label>
                <select id="type" {...register("type")} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border">
                  <option value={EmployeeType.JOURNALIER}>Journalier</option>
                  <option value={EmployeeType.CDI}>CDI</option>
                  <option value={EmployeeType.POOL_EXTRA}>Pool Extra</option>
                </select>
              </div>
               <div>
                <label htmlFor="departmentId" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Département</label>
                <select id="departmentId" {...register("departmentId")} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border">
                    <option value="">-- Non assigné --</option>
                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
              </div>
            </div>

            {contractType === 'CDI' && (
              <div className="p-4 my-2 border-l-4 border-primary bg-primary/10 dark:bg-dark-surface space-y-4 rounded-r-md">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="salaireDeBase" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Salaire de Base (MAD)</label>
                          <input id="salaireDeBase" type="number" step="0.01" {...register("salaireDeBase")} placeholder="0.00" className="w-full p-2 border rounded bg-white dark:bg-dark-background" />
                      </div>
                       <div>
                          <label htmlFor="defaultPayRateId" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Tarif Heures Sup.</label>
                          <select id="defaultPayRateId" {...register("defaultPayRateId")} className="w-full p-2 border rounded bg-white dark:bg-dark-background">
                            <option value="">-- Non spécifié --</option>
                            {payRates.map(rate => ( <option key={rate.id} value={rate.id}>{rate.name}</option> ))}
                          </select>
                      </div>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="numeroCNSS" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">N° CNSS</label>
                          <input id="numeroCNSS" {...register("numeroCNSS")} className="w-full p-2 border rounded bg-white dark:bg-dark-background" />
                      </div>
                       <div>
                          <label htmlFor="numeroCIN" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">N° CIN</label>
                          <input id="numeroCIN" {...register("numeroCIN")} className="w-full p-2 border rounded bg-white dark:bg-dark-background" />
                      </div>
                  </div>
              </div>
            )}
            
            {contractType !== 'CDI' && (
              <div>
                <label htmlFor="defaultPayRateId" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Tarif par Défaut</label>
                <select id="defaultPayRateId" {...register("defaultPayRateId")} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border">
                  <option value="">-- Non spécifié --</option>
                  {payRates.map(rate => ( <option key={rate.id} value={rate.id}>{rate.name} ({rate.amount} MAD/{rate.type})</option> ))}
                </select>
              </div>
            )}

            <div>
                <label htmlFor="role" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Rôle Système</label>
                <select id="role" {...register("role")} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border">
                  <option value={Role.FIELD_WORKER}>Employé de terrain</option>
                  <option value={Role.MANAGER}>Manager</option>
                  <option value={Role.FINANCE}>Finance</option>
                  <option value={Role.ADMIN}>Administrateur</option>
                </select>
            </div>

            <div className="pt-4 border-t dark:border-dark-border">
                <p className="text-sm text-gray-500 dark:text-dark-subtle">{employee ? "Modifier le mot de passe (laisser vide pour ne pas changer)" : "Définir un mot de passe"}</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="relative">
                        <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Mot de passe</label>
                        <input id="password" type={showPassword ? "text" : "password"} {...register("password")} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-500"><EyeOff size={16} /></button>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Confirmer le mot de passe</label>
                        <input id="confirmPassword" type={showPassword ? "text" : "password"} {...register("confirmPassword")} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background" />
                    </div>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg dark:bg-dark-surface">
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 ml-2 font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center">
              {isSubmitting && <Loader2 className="animate-spin mr-2"/>}Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}