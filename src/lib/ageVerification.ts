/**
 * Utility functions for age verification
 */

/**
 * Check if a user is 21 years or older
 * @param dateOfBirth - The user's date of birth
 * @returns boolean - true if user is 21 or older, false otherwise
 */
export function isUser21OrOlder(dateOfBirth?: Date): boolean {
  if (!dateOfBirth) {
    return false; // If no date of birth provided, assume underage
  }

  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 21;
}

/**
 * Calculate user's age
 * @param dateOfBirth - The user's date of birth
 * @returns number - The user's age in years
 */
export function calculateAge(dateOfBirth?: Date): number {
  if (!dateOfBirth) {
    return 0;
  }

  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format date of birth for display
 * @param dateOfBirth - The user's date of birth
 * @returns string - Formatted date string
 */
export function formatDateOfBirth(dateOfBirth?: Date): string {
  if (!dateOfBirth) {
    return '';
  }
  
  return new Date(dateOfBirth).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
