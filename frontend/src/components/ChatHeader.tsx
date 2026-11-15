
type MobileOverlay = "chats" | "contacts" | "settings" | null;

type ChatHeaderProps = {
  mobileOverlay: MobileOverlay;
  toggleMobileOverlay: (overlay: Exclude<MobileOverlay, null>) => void;
  handleLogout: () => void;
};


function ChatHeader({
  mobileOverlay,
  toggleMobileOverlay,
  handleLogout,
}: ChatHeaderProps) {
  return (
    <header className="chat-header">


      <nav
        className="mobile-nav"
        aria-label="Chattmeny"
      >
        <button
          type="button"
          className={
            mobileOverlay === "chats" ? "active" : ""
          }
          onClick={() =>
            toggleMobileOverlay("chats")
          }
          aria-expanded={mobileOverlay === "chats"}
          aria-controls="mobile-overlay-panel"
        >Chattar
        </button>

        <button
          type="button"
          className={
            mobileOverlay === "contacts" ? "active" : ""
          }
          onClick={() =>
            toggleMobileOverlay("contacts")
          }
          aria-expanded={mobileOverlay === "contacts"}
          aria-controls="mobile-overlay-panel"
        >Kontakter
        </button>

        <button
          type="button"
          className={
            mobileOverlay === "settings" ? "active" : ""
          }
          onClick={() =>
            toggleMobileOverlay("settings")
          }
          aria-expanded={mobileOverlay === "settings"}
          aria-controls="mobile-overlay-panel"
        >
          Språk
        </button>
      </nav>
      <h1>Chappy</h1>

      <button
        type="button"
        onClick={handleLogout}
      >
        Logga ut
      </button>

    </header>
  );
}

export default ChatHeader;
