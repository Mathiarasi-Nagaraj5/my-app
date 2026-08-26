import { Product } from "@/app/lib/types";

const API = process.env.NEXT_API_URL || "";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getProducts(
  params?: URLSearchParams
): Promise<Product[]> {
  const url = params
    ? `${API}/api/products?${params.toString()}`
    : `${API}/api/products`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch products:", res.status, res.statusText,res);
    throw new Error("Failed to fetch products");
  }

  const result: ApiResponse<Product[]> = await res.json();
  console.log("Fetched products:", result.data); // Log the fetched products
  return result.data;
}

export async function getBestsellers() {
  const params = new URLSearchParams();

  params.append("bestseller", "true");

  return getProducts(params);
}


export async function getCategories() {
  const res = await fetch(`${API}/api/products/categories`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const result = await res.json();

  return result.data;
}
export async function getProductBySlug(slug: string) {
  const res = await fetch(
    `${API}/api/products/slug/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  const result: ApiResponse<{
    product: Product;
    relatedProducts: Product[];
  }> = await res.json();

  return result.data;
}