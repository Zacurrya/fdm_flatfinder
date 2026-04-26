import { supabase } from "@lib/supabase";

/**
 * StorageService
 * 
 * Centralized service for interacting with Supabase Storage buckets.
 * Handles uploading, deleting, and generating public URLs for files.
 */
export const StorageService = {
  /**
   * Uploads a file from a local URI to a specified Supabase bucket.
   * @params bucket name, local file uri, options
   * @returns The relative path of the uploaded file within the bucket.
   */
  async uploadFile(
    bucket: string,
    uri: string,
    options: {
      pathPrefix?: string;
      upsert?: boolean;
      contentType?: string;
    } = {}
  ): Promise<string> {
    const { pathPrefix = "", upsert = false } = options;

    // Resolve file extension and name
    const ext = uri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
    const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
    const uniquePart = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const fileName = pathPrefix
      ? `${pathPrefix.replace(/\/$/, "")}/${uniquePart}.${safeExt}`
      : `${uniquePart}.${safeExt}`;

    // Prepare content type if not provided
    const contentType = options.contentType || (
      safeExt === "heic" ? "image/heic" :
        safeExt === "png" ? "image/png" :
          "image/jpeg"
    );

    // Read file as ArrayBuffer using fetch
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();


    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, { contentType, upsert });

    if (error) {
      throw error;
    }


    return this.getPublicUrl(bucket, fileName);
  },

  /**
   * Generates a public URL for a file in a Supabase bucket.
   * 
   * @param bucket Name of the Supabase storage bucket.
   * @param path Relative path of the file within the bucket.
   * @returns The full public URL.
   */
  getPublicUrl(bucket: string, path: string): string {
    if (!path) return "";

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const url = data.publicUrl;


    return url;
  },

  /**
   * Removes one or more files from a Supabase bucket.
   * 
   * @param bucket Name of the Supabase storage bucket.
   * @param paths Array of relative paths to remove.
   */
  async deleteFiles(bucket: string, paths: string[]): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw error;
  },

  /**
   * Extracts the relative path from a full Supabase public URL.
   * Useful for deleting files when the full URL is stored in the database.
   */
  getPathFromUrl(bucket: string, url: string): string | null {
    if (!url || !url.includes(`/public/${bucket}/`)) return null;
    const parts = url.split(`/public/${bucket}/`);
    return parts.length > 1 ? parts[1] : null;
  },

  /**
   * Convenience method to delete a single file.
   */
  async deleteFile(bucket: string, pathOrUrl: string): Promise<void> {
    const path = pathOrUrl.startsWith("http")
      ? this.getPathFromUrl(bucket, pathOrUrl)
      : pathOrUrl;

    if (!path) return;
    return this.deleteFiles(bucket, [path]);
  }
};
