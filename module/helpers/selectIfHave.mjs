export default function selectIfHave(level, index) {
    if (!Number.isInteger(level) || !Number.isInteger(index)) {
        return "";
    }
    return level >= (index + 1) ? "S0-selected" : "";
}