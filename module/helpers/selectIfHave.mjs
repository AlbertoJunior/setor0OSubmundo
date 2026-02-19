export default function selectIfHave(level, index) {
  if (!Number.isInteger(level) || !Number.isInteger(index)) {
    return "";
  }
  return level >= index ? "S0-selected" : "";
}