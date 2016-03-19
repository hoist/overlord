export function sanitiseName(name) {
  var lowerCaseString = name.toLowerCase();
  return lowerCaseString.replace(/\W+/g, "");
}
