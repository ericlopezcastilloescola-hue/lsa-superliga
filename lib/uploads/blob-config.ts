export function getBlobConfig() {
  return {
    onVercel: Boolean(process.env.VERCEL),
    hasToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    hasStoreId: Boolean(process.env.BLOB_STORE_ID),
  };
}

export function shouldUseBlobStorage(): boolean {
  const { onVercel, hasToken, hasStoreId } = getBlobConfig();
  if (onVercel) return hasToken || hasStoreId;
  return hasToken;
}

export function getBlobUploadErrorHelp(): string {
  return "Conecta Vercel Blob al proyecto lsa-superliga-clubes-pro, verifica BLOB_READ_WRITE_TOKEN y haz Redeploy.";
}
