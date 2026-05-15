import { API_URL } from "./config";
import { SiteConfigKey } from "@/types/configuration";

export async function getSiteConfig<T>(key: SiteConfigKey): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/configurations/${key}`, {
      // For Public content, we want fresh data but can cache for performance.
      // Since it's editable content, maybe revalidate every hour or 'no-store'.
      // For now, let's use 'no-store' to ensure updates are visible immediately.
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`Failed to fetch config for ${key}: ${res.statusText}`);
      return null;
    }

    const text = await res.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error(`Invalid JSON for ${key}:`, text);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching config for ${key}:`, error);
    return null;
  }
}

export async function updateSiteConfig(key: SiteConfigKey, data: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/configurations/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // Important: Sends the HttpOnly Authentication cookie
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to update config for ${key}: ${res.statusText}`, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error updating config for ${key}:`, error);
    return false;
  }
}
