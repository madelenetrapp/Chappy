
import bcrypt from "bcrypt";
// Importerar biblioteket för lösenordshashning.

async function hashPassword(password: string): Promise<string> {
  // Tar emot ett lösenord och returnerar en hash som sträng.

  const saltRounds = 10;
  // Anger bcrypts kostnadsfaktor för hashningen.

  return bcrypt.hash(password, saltRounds);
  // Skapar en saltad hash av lösenordet och returnerar resultatet.
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Tar emot lösenordet från användaren och hashen från databasen.

  return bcrypt.compare(password, hashedPassword);
  //kontrollerar om lösenordet matchar den sparade hashen.
}

export { hashPassword, verifyPassword };

// const saltRounds = 10; anger hur mycket beräkningsarbete bcrypt ska utföra när lösenordet hashas.
// - 10 innebär \(2^{10} = 1\,024\) interna bearbetningssteg.
// - Ett högre värde gör hashningen långsammare och försvårar lösenordsknäckning.
// - Ett lägre värde gör hashningen snabbare men ger svagare skydd.
// Exempel:
// saltRounds	Arbetsfaktor
// 10	1 024
// 11	2 048
// 12	4 096

// Varje ökning med 1 fördubblar ungefär beräkningsarbetet.

// I Chappy: använder 10 som en startnivå för projektet.

// Observera att saltRounds är bcrypts kostnadsfaktor, inte antalet gånger ett salt läggs till.