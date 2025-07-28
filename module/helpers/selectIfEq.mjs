export default function selectIfEq(item, eq) {
    if (!item) {
        return "";
    }
    return item === eq ? "selected" : "";
}