export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function parseCurrency(value: string): number | null {
  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  const amount = Number(trimmed);

  if (Number.isNaN(amount)) {
    return null;
  }

  return amount;
}

// Chat regex hope it works
export function isValidCurrencyInput(value: string): boolean {
  return /^\d*\.?\d{0,2}$/.test(value);
}