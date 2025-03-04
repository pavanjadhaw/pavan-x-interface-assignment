import humanizeDuration from "humanize-duration";

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: "shortEn",
  languages: {
    shortEn: {
      y: () => "y",
      mo: () => "mo",
      w: () => "w",
      d: () => "d",
      h: () => "h",
      m: () => "m",
      s: () => "s",
      ms: () => "ms",
    },
  },
});

export function humanizeTimeDifference(
  startTime: Date | string,
  currentTime: Date = new Date()
): string {
  const duration = currentTime.getTime() - new Date(startTime).getTime();

  return shortEnglishHumanizer(duration, {
    round: true,
    units: ["y", "mo", "w", "d", "h", "m", "s"],
    largest: 1,
    spacer: "",
  });
}
