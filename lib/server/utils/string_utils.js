"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitiseName = sanitiseName;
function sanitiseName(name) {
  var lowerCaseString = name.toLowerCase();
  return lowerCaseString.replace(/\W+/g, "");
}
//# sourceMappingURL=../../maps/server/utils/string_utils.js.map
