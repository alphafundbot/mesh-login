console.log("MCP server listening on 9002");
# bind to 9002
require('http').createServer((req, res) => {
  res.end("MCP OK");
}).listen(9002);
