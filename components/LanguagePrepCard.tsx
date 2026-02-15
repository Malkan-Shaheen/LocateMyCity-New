type Props = {
  country: string;
  language: string;
};

export default function LanguagePrepCard({ country, language }: Props) {
  return (
    <section className="language-prep">
      <h3>Travel tip for {country}</h3>

      <p>
        Learning a few basic phrases in <strong>{language}</strong> can make
        everyday travel easier — from ordering food to asking for directions.
      </p>

      <a
        href="/go/learn-language"
        rel="nofollow sponsored"
        className="language-link"
      >
        Learn basic {language} before you go →
      </a>
    </section>
  );
}
