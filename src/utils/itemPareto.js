/**
 * Ubah respons /api/dashboard/pareto-items menjadi baris per pasangan
 * (itemId, jenis defect). Backend sudah mengagregasikan jumlah NG-nya.
 */
export function buildPairPareto(items = []) {
  if (!Array.isArray(items)) return [];
  const rows = items.flatMap(item =>
    (Array.isArray(item.defects) ? item.defects : []).map(defect => ({
      itemId: item.itemId,
      itemName: item.itemName || `Item ${item.itemId}`,
      partNumber: item.partNumber || '',
      defectName: defect.defectName || '-',
      quantity: Number(defect.quantity) || 0
    }))
  ).filter(row => row.quantity > 0);

  rows.sort((a, b) => b.quantity - a.quantity
    || a.itemName.localeCompare(b.itemName, 'id')
    || a.defectName.localeCompare(b.defectName, 'id')
    || Number(a.itemId) - Number(b.itemId));

  const total = rows.reduce((sum, row) => sum + row.quantity, 0);
  let running = 0;
  return rows.map((row, index) => {
    running += row.quantity;
    return {
      ...row,
      axisKey: String(index + 1), // Label sumbu unik untuk setiap part-defect.
      rank: index + 1,
      percentage: total ? row.quantity / total * 100 : 0,
      cumulative: total ? running / total * 100 : 0
    };
  });
}

/** Tabel di Detail Item: pembagi persentase hanya NG milik item tersebut. */
export function buildItemDetail(item) {
  if (!item || !Array.isArray(item.defects)) return [];
  const rows = item.defects.map(defect => ({
    defectName: defect.defectName || '-',
    quantity: Number(defect.quantity) || 0
  })).filter(row => row.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity
      || a.defectName.localeCompare(b.defectName, 'id'));
  const total = rows.reduce((sum, row) => sum + row.quantity, 0);
  let running = 0;
  return rows.map((row, index) => {
    running += row.quantity;
    return {
      ...row,
      rank: index + 1,
      percentage: total ? row.quantity / total * 100 : 0,
      cumulative: total ? running / total * 100 : 0
    };
  });
}
