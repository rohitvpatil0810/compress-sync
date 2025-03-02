import { z } from "zod";

// validation schema
export const csvSchema = z.object({
  serialNumber: z.number().int().positive(),
  productName: z.string().min(1, "Product name is required"),
  inputImageUrls: z.string().refine((urls) => {
    // Validate URLs (comma-separated)
    const urlArray = urls.split(",");
    return urlArray.every((url) => isValidURL(url.trim()));
  }, "Invalid image URLs"),
});

// Helper function to check if a URL is valid
function isValidURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}
