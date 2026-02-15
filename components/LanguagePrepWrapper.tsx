import LanguagePrepCard from "./LanguagePrepCard";

type Props = {
  destination: {
    country?: string;
    language?: string | {
      name: string;
      code?: string;
    };
  };
};

export default function LanguagePrepWrapper({ destination }: Props) {
  // Guard: must have a country
  if (!destination?.country) return null;

  // Normalize language (string or object)
  const language =
    typeof destination.language === "string"
      ? destination.language
      : destination.language?.name;

  // Guard: must have a language
  if (!language) return null;

  return (
    <LanguagePrepCard
      country={destination.country}
      language={language}
    />
  );
}
