export function generateId() {
  // Generate a valid UUID for Supabase
  return crypto.randomUUID();
}