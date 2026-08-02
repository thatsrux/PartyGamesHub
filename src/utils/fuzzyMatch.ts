export function normalizeStr(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, ""); // remove all non-alphanumeric (including spaces)
}

export function levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

export function checkAnswerFuzzy(userAnswer: string, correctAnswers: string[]): boolean {
    const normUser = normalizeStr(userAnswer);
    if (!normUser) return false;
    
    for (const ans of correctAnswers) {
        const normAns = normalizeStr(ans);
        if (!normAns) continue;
        
        // Se è esatto (dopo la normalizzazione senza spazi/accenti)
        if (normUser === normAns) return true;
        
        // Calcola la distanza
        const dist = levenshteinDistance(normUser, normAns);
        
        // Tolleranza: 1 errore ogni 4 o 5 lettere (max 1 per parole corte, 2-3 per parole lunghe)
        let threshold = 1;
        if (normAns.length >= 8) threshold = 2;
        if (normAns.length >= 12) threshold = 3;
        
        // Parole molto corte devono essere esatte o quasi esatte
        if (normAns.length <= 3) threshold = 0;
        
        if (dist <= threshold) {
            return true;
        }
    }
    
    return false;
}
