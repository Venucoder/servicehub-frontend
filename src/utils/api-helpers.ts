/**
 * Extract data from Django REST Framework paginated response
 */
export function extractPaginatedData<T>(response: any): T[] {
  // If response has 'results' key (paginated), return results
  if (response && typeof response === 'object' && 'results' in response) {
    return response.results || [];
  }
  // If response is already an array, return it
  if (Array.isArray(response)) {
    return response;
  }
  // Otherwise return empty array
  return [];
}

/**
 * Get pagination info from response
 */
export function getPaginationInfo(response: any) {
  return {
    count: response?.count || 0,
    next: response?.next || null,
    previous: response?.previous || null,
  };
}