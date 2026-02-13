import { cookies } from "next/headers";
import { API_URL } from "@/lib/config";
import { CategoriesTable } from "@/components/admin/CategoriesTable";

async function getCategories() {
  const cookieStore = cookies();
  const token = cookieStore.get("Authentication")?.value;
  const headers = { Cookie: `Authentication=${token}` };

  const res = await fetch(`${API_URL}/categories`, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.statusText}`);
  }

  return res.json();
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Catégories</h1>
      <CategoriesTable initialCategories={categories} />
    </div>
  );
}
