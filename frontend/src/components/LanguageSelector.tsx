
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
          <input
            type="radio"
            name={groupName}
            value={language}
            checked={selectedLanguage === language}
            onChange={() => {
              setSelectedLanguage(language);

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
