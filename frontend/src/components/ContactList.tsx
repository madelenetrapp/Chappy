
import type { User } from "../api/usersApi.js";
import contactIcon from "../assets/contact-icon.svg";

type ContactListProps = {
  users: User[];
  selectedContact: string | null;
  setSelectedContact: (username: string) => void;
  recipient: string;
  setRecipient: (username: string) => void;
  handleCreateDM: () => Promise<void>;
};

function ContactList({
  users,
  selectedContact,
  setSelectedContact,
  recipient,
  setRecipient,
  handleCreateDM,
}: ContactListProps) {
  return (
    <div className="sidebar-list contacts-container">
      <div className="contacts-scroll">
        {users.map((user) => (
          <button
            key={user.userId}
            type="button"
            className={`sidebar-item contact-item ${selectedContact === user.username ? "active" : ""
              }`}
            aria-pressed={selectedContact === user.username}
            onClick={() => {
              setSelectedContact(user.username);
              setRecipient(user.username);
            }}
          >
            <img
              src={contactIcon}
              className="contact-icon"
              alt=""
              aria-hidden="true"
            />

            <span className="contact-name">
              {user.username}
            </span>

          </button>
        ))}
      </div>

      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Användarnamn"
        aria-label="Användarnamn"
      />

      <button
        type="button"
        onClick={() => handleCreateDM()}
      >
        Starta DM
      </button>
    </div>
  );
}

export default ContactList;
