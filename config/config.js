const env = process.env.NODE_ENV || "development"; // set the environment

console.log("env -------", env);

if (env === "development" || env === "test") {
  const config = require("./config.json");
  const envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    // turn the envConfig object into an array of key names
    process.env[key] = envConfig[key]; // for each key, set process.env[key] to the value of that key (taken from envConfig object)
  });
}
