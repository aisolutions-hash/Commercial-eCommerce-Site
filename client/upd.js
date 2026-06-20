import * as fs from 'fs';

const descriptions = JSON.parse(fs.readFileSync('desc.json', 'utf8'));
let content = fs.readFileSync('src/data.ts', 'utf8');

for (const [id, desc] of Object.entries(descriptions)) {
  const marker = "id: '" + id + "',";
  const split = content.split(marker);
  if (split.length > 1) {
    const descMarker = "description: '";
    const chunk = split[1];
    const descStart = chunk.indexOf(descMarker);
    if (descStart !== -1) {
      const descEnd = chunk.indexOf("',", descStart);
      if (descEnd !== -1) {
        const insertion = "\\n    longDescription: " + JSON.stringify(desc) + ",";
        split[1] = chunk.slice(0, descEnd + 2) + insertion + chunk.slice(descEnd + 2);
        content = split.join(marker);
      }
    }
  }
}

fs.writeFileSync('src/data.ts', content, 'utf8');
