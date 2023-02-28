import express from "express";

const apiRouter = express.Router();

apiRouter.post("/videos/:id/view");
export default apiRouter;
