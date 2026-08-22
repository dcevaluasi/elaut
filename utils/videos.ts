export const extractYoutubeId = (url: string) => {
    if (!url) return "";
    try {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    } catch (e) {
        return url;
    }
}