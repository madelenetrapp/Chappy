import LanguageSelector from "./LanguageSelector.js";
import leftArrow from "../assets/left-arrow.svg";
import rightArrow from "../assets/right-arrow.svg";
import type { Dispatch, SetStateAction } from "react";

type ChatSettingsProps = {
  showSettings: boolean;
  setShowSettings: (value: boolean) => void;
  selectedLanguage: string;
  setSelectedLanguage: (value: string) => void;
  setTranslations: Dispatch<SetStateAction<Record<string, string>>>;
};


function ChatSettings({
  showSettings,
  setShowSettings,
  selectedLanguage,
  setSelectedLanguage,
  setTranslations,
}: ChatSettingsProps) {
  return (
    <aside className="chat-settings">

      {/* Ljusblå container för språkval */}
      <section className="settings-section">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() =>
            setShowSettings(!showSettings)
          }
          aria-expanded={showSettings}
          aria-controls="language-settings"
        >
          <span>Språkinställningar</span>

          <img
            className="sidebar-arrow"
            src={
              showSettings ? leftArrow : rightArrow
            }
            alt=""
            aria-hidden="true"
          />
        </button>

        {/* visar språkvaln */}
        {showSettings && (
          <div id="language-settings">
            <LanguageSelector
              groupName="desktop-language"
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              setTranslations={setTranslations}
            />
          </div>
        )}
      </section>
    </aside>
  );
}

export default ChatSettings;