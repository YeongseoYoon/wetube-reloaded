import "./db";
import "./models/Video";
import app from "./server";

//define port number
const PORT = 4000;

const handleListening = () => console.log(`Server listening on port http://localhost:${PORT}`);
app.listen(4000, handleListening);