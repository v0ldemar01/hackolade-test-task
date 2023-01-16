/* eslint-disable @typescript-eslint/no-unused-vars */
const isJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
  } catch (err) {
    return false;
  }
  return true;
};

export { isJsonString };