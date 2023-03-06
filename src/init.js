import "regenerator-runtime";
import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

//define port number
const PORT = process.env.PORT || 4000;
console.log("이건" + process.env.NODE_ENV);
const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT}`);
app.listen(4000, handleListening);
