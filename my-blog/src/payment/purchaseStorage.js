// Remembers an in-flight or finished purchase so a buyer who leaves before
// the download finishes can pick up where they left off.
const KEY = 'pipelineAudit.purchase';

export function loadPurchase(chainId) {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!data || data.chainId !== chainId || typeof data.txHash !== 'string') return null;
    return data;
  } catch {
    return null;
  }
}

export function savePurchase(purchase) {
  try {
    localStorage.setItem(KEY, JSON.stringify(purchase));
  } catch {
    // Storage blocked (private mode, etc.). Resume just won't be available.
  }
}

export function clearPurchase() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
