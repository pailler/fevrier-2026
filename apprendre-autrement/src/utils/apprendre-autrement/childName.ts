const CHILD_NAME_STORAGE_KEY = 'learn-differently-child-name';
const DEFAULT_CHILD_NAME = 'Adent'; // Prononcé "adent" (sans le "m" de Adam)

export function getChildName(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_CHILD_NAME;
  }
  
  const saved = localStorage.getItem(CHILD_NAME_STORAGE_KEY);
  return saved || DEFAULT_CHILD_NAME;
}

export function setChildName(name: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const trimmedName = name.trim();
  if (trimmedName) {
    localStorage.setItem(CHILD_NAME_STORAGE_KEY, trimmedName);
  } else {
    localStorage.removeItem(CHILD_NAME_STORAGE_KEY);
  }
}



