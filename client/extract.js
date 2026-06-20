const fs = require('fs');
const content = fs.readFileSync('update_data.js', 'utf8');
const objRaw = content.substring(content.indexOf('const descriptions = {'), content.indexOf('};\n\nfor') + 1);
fs.writeFileSync('desc.js', objRaw + '\nmodule.exports = descriptions;\n', 'utf8');
