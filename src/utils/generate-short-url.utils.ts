export const generateShortUrl = (len = 8): string => {
  // Define all the possible characters that could go into a string
  const possibleCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  // Start the final string
  let str = "";
  for (let i = 1; i <= len; i++) {
    // Get a random character from the possibleCharacters string
    let randomCharacter = possibleCharacters.charAt(
      Math.floor(Math.random() * possibleCharacters.length)
    );
    // Append this character to the string
    str += randomCharacter;
  }
  // Return the final string
  return str;
};
