import express from "express";
import {see, edit, upload, deleteVideo} from "../controllers/videoController"

const videoRouter = express.Router();

//It's very important to keep the sequence
//the /upload should be the first one 
//cuz if some of users request for http://localhost:4000/videos/upload,
//the router can be confused between real-upload and :id-upload
//But if you use with regular expression, that kinda problems will be nothing
videoRouter.get("/upload", upload);
videoRouter.get("/:id(\\d+)", see);
videoRouter.get("/:id(\\d+)/edit", edit);
videoRouter.get("/:id(\\d+)/delete", deleteVideo);

export default videoRouter;