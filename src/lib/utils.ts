import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale/pl";

export const formatTimeSince = (
  isoDateString: string,
  lang: string
): string => {
  const pastDate = new Date(isoDateString);

  return formatDistanceToNow(pastDate, {
    addSuffix: true,
    locale: lang === "pl" ? pl : undefined,
  });
};
