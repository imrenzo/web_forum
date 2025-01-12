export default function FormatDate(dateStr: string): string {
    if (!dateStr) {
        console.log("UNDEFINED DATE STR: ", dateStr);
        return "error";
    }

    const trimmedDateStr = dateStr.split('.')[0];
    const date = new Date(trimmedDateStr);

    return new Intl.DateTimeFormat('en-SG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(date);
}