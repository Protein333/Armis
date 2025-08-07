// split ja
export function splitIntoSentencesJa(paragraph: string, divider: string, minimum: number): string[] {
  const sentences = paragraph
    .split(divider) // Split by the Japanese full stop
    .map((sentence) => sentence.trim()) // Trim whitespace
    .filter((sentence) => sentence.length > 0); // Remove empty sentences

  return sentences
    .reduce<string[]>((acc, sentence) => {
      if (acc.length > 0 && acc[acc.length - 1].length < minimum) {
        acc[acc.length - 1] += divider + sentence;
      } else {
        acc.push(sentence);
      }
      return acc;
    }, [])
    .map((sentence, index, array) => (index < array.length - 1 || paragraph.endsWith(divider) ? sentence + divider : sentence));
}

export const recursiveSplitJa = (text: string) => {
  const delimiters = ["。", "？", "！", "、"];
  return delimiters
    .reduce<string[]>(
      (textData, delimiter) => {
        return textData.map((textInner) => splitIntoSentencesJa(textInner, delimiter, 7)).flat(1);
      },
      [text],
    )
    .flat(1);
};

// replace ja

interface Replacement {
  from: string;
  to: string;
}

export function replacePairsJa(replacements: Replacement[]) {
  return (str: string) => {
    return replacements.reduce((tmp, current) => {
      const { from, to } = current;
      // Escape any special regex characters in the 'from' string.
      const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedFrom, "g");
      return tmp.replace(regex, to);
    }, str);
  };
}

export const replacementsJa: Replacement[] = [
  { from: "Anthropic", to: "アンスロピック" },
  { from: "OpenAI", to: "オープンエーアイ" },
  { from: "AGI", to: "エージーアイ" },
  { from: "GPU", to: "ジーピーユー" },
  { from: "TPU", to: "ティーピーユー" },
  { from: "CPU", to: "シーピーユー" },
  { from: "LPU", to: "エルピーユー" },
  { from: "Groq", to: "グロック" },
  { from: "TSMC", to: "ティーエスエムシー" },
  { from: "NVIDIA", to: "エヌビディア" },
  { from: "1つ", to: "ひとつ" },
  { from: "2つ", to: "ふたつ" },
  { from: "3つ", to: "みっつ" },
  { from: "4つ", to: "よっつ" },
  { from: "5つ", to: "いつつ" },
  { from: "危険な面", to: "危険なめん" },
  { from: "その通り！", to: "その通り。" },
  { from: "%", to: "パーセント" },
  { from: "IPO", to: "アイピーオー" },
];
