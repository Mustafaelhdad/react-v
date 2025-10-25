export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error(
      `Error getting item from localStorage: ${key}, error: ${error}`,
    );
    return null;
  }
}

export function setItem<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(
      `Error setting item in localStorage: ${key}, error: ${error}`,
    );
    return null;
  }
}

export function removeItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(
      `Error removing item from localStorage: ${key}, error: ${error}`,
    );
    return null;
  }
}
