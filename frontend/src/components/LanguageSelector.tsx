// Språkval - Figma
const languages: string[] = [
  "Svenska",
  "Engelska",
  "Arabiska",
  "Tyska",
  "Mandarin",
];

type LanguageSelectorProps = {
  groupName: string;
  selectedLanguage: string;
  setSelectedLanguage: (string: string) => void;
  setTranslations: (translations: Record<string, string>) => void;
};

//  språkval med radioknappar
 function LanguageSelector({
  groupName,
  selectedLanguage,
  setSelectedLanguage,
  setTranslations,
}: LanguageSelectorProps) {
    return (
      <div className="language-list">
        {languages.map((language) => (
          <label
            className="language-option"
            key={language}
          >
            {/* Radioknapp för valt språk */}
            <input
              type="radio"
              name={groupName}
              value={language}
              checked={selectedLanguage === language}
              onChange={() => {
                // Uppdaterar användarens valda språk
                setSelectedLanguage(language);

                // Tömmer gamla översättningar
                setTranslations({});
              }}
            />

            <span>{language}</span>
          </label>
        ))}
      </div>
    );
  }

  export default LanguageSelector;