const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dns.resolveSrv("_mongodb._tcp.cluster0.isqxcru.mongodb.net", (err, addresses) => {
  if (err) {
    console.error("FAILED:", err);
  } else {
    console.log("SUCCESS:", addresses);
  }
});