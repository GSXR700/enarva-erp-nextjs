// app/administration/leads/new/page.tsx
import { getLeadFormData } from "../actions";
import { NewLeadClientPage } from "./NewLeadClientPage";

// This is an async Server Component to fetch data
export default async function NewLeadPage() {
  // Fetch the required data for the form's dropdowns
  const { users, subcontractors } = await getLeadFormData();

  return (
    // Pass the fetched data as props to the new client component
    <NewLeadClientPage users={users} subcontractors={subcontractors} />
  );
}