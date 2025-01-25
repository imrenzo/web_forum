export default function FormatDate(dateStr: string): string {
    if (!dateStr) {
        console.log("UNDEFINED DATE STR: ", dateStr);
        return "error";
    }

    const splitDateStr = dateStr.split('.')[0];
    const date = new Date(splitDateStr);

    return new Intl.DateTimeFormat('en-SG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(date);
}