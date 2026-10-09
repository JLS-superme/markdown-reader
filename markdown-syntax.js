(function (root) {
  // Shared by preview, syntax highlighting, formatting repair and Word export.
  function readFence(line) {
    const match = String(line).match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!match) return null;
    return { character: match[1][0], length: match[1].length, info: match[2].trim() };
  }

  function openFence(line) {
    const fence = readFence(line);
    // Backticks are not permitted in the info string of a backtick fence.
    return fence && !(fence.character === "`" && fence.info.includes("`")) ? fence : null;
  }

  function closesFence(line, opening) {
    const closing = readFence(line);
    return Boolean(opening && closing && closing.character === opening.character &&
      closing.length >= opening.length && closing.info === "");
  }

  const syntax = { openFence, closesFence };
  if (typeof module === "object" && module.exports) module.exports = syntax;
  else root.markdownSyntax = syntax;
})(typeof globalThis === "object" ? globalThis : this);
