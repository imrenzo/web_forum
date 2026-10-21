// search terms are user input, so regex metacharacters must be matched literally
export function EscapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
