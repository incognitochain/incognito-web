export const replaceVariables = (str, replacements = {}) => {
  Object.keys(replacements).map(replacementKey => {
    const replacementValue = replacements[replacementKey];
    const re = new RegExp(`\\{\\{\\s*${replacementKey}\\s*\\}\\}`, 'g');
    str = str.replace(re, replacementValue);
  });
  return str;
};
