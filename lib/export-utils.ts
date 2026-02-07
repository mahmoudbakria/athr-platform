/**
 * Utility to export data to CSV with Arabic support (UTF-8 BOM)
 */

export function exportToCSV(filename: string, rows: object[]) {
    if (!rows || !rows.length) {
        return;
    }

    // 1. Extract headers from the first object
    const headers = Object.keys(rows[0]);

    // 2. Format rows
    const csvContent = [
        // Header row
        headers.join(','),
        // Data rows
        ...rows.map(row => {
            return headers.map(header => {
                let value = (row as any)[header] ?? '';

                // Format dates: YYYY-MM-DD
                if (value instanceof Date) {
                    value = value.toISOString().split('T')[0];
                } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
                    // Try to catch ISO strings
                    const d = new Date(value);
                    if (!isNaN(d.getTime())) {
                        value = d.toISOString().split('T')[0];
                    }
                }

                // Handle strings with commas or quotes
                const stringValue = String(value).replace(/"/g, '""');
                return `"${stringValue}"`;
            }).join(',');
        })
    ].join('\n');

    // 3. Arabic Support: Prepend \uFEFF (Byte Order Mark)
    const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // 4. Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
