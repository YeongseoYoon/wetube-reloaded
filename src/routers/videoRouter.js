import express from "express";
import {
    watch,
    getUpload,
    getEdit,
    postEdit,
    postUpload,
  } from "../controllers/videoController";
const videoRouter = express.Router();

//It's very important to keep the sequence
//the /upload should be the first one 
//cuz if some of users request for http://localhost:4000/videos/upload,
//the router can be confused between real-upload and :id-upload
//But if you use with regular expression, that kinda problems will be nothing
videoRouter.get("/:id(\\d+)", watch);
videoRouter.get("/:id(\\d+)/edit", getEdit);
videoRouter.post("/:id(\\d+)/edit", postEdit);
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit);
videoRouter.route("/upload").get(getUpload).post(postUpload);

export default videoRouter;