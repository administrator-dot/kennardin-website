const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outputFile = path.join(rootDir, "search-index.json");

const skipFiles = new Set(["header.html", "footer.html", "nav.html"]);

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&ndash;/gi, "-")
    .replace(/&mdash;/gi, "-");
}

function stripHtml(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractTitle(html, fileName) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (m && m[1]) return stripHtml(m[1]);
  return fileName.replace(/\.html$/i, "");
}

function extractHeadings(html) {
  const headings = [];
  const re = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let match = re.exec(html);
  while (match) {
    const text = stripHtml(match[1]);
    if (text) headings.push(text);
    match = re.exec(html);
  }
  return headings;
}

function buildEntry(fileName) {
  const fullPath = path.join(rootDir, fileName);
  const html = fs.readFileSync(fullPath, "utf8");
  const title = extractTitle(html, fileName);
  const content = stripHtml(html);
  const headings = extractHeadings(html);

  return {
    title,
    url: fileName,
    headings,
    snippet: content.slice(0, 280),
    content: content.toLowerCase(),
  };
}

function main() {
  const htmlFiles = fs
    .readdirSync(rootDir)
    .filter((name) => name.toLowerCase().endsWith(".html"))
    .filter((name) => !skipFiles.has(name))
    .sort();

  const index = htmlFiles.map(buildEntry);
  fs.writeFileSync(outputFile, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  process.stdout.write(`Built ${index.length} entries: ${outputFile}\n`);
}

main();
