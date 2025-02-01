export function isEmpty(data: object | string | undefined | null): boolean {
   if (data === undefined || data === null) {
      return true; // Return true for undefined or null
   }

   if (typeof data === "string") {
      return data.length === 0; // Check if the string is empty
   }

   if (typeof data === "number") {
      return false; // Return false for numbers
   }

   if (Array.isArray(data)) {
      return data.length === 0; // Check if the array is empty
   }

   return Object.keys(data).length === 0; // Check if the object has no keys
}