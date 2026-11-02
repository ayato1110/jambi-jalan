const formatRupiahId = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const formatAngkaId = new Intl.NumberFormat("id-ID");

export function formatRupiah(nilai: number): string {
  return formatRupiahId.format(nilai);
}

export function formatAngka(nilai: number): string {
  return formatAngkaId.format(nilai);
}

export function formatPersen(nilai: number, digit = 1): string {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: digit }).format(nilai)}%`;
}

export function formatDesimal(nilai: number, digit = 1): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digit,
    maximumFractionDigits: digit,
  }).format(nilai);
}
