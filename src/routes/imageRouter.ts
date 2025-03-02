import { Router } from "express";
import multer from "multer";
import ImageController from "../controllers/ImageController";
const imageRouter = Router();

const upload = multer();

imageRouter.post("/", upload.single("image"), ImageController.uploadImage);
imageRouter.get("/:key", ImageController.getImage);

export default imageRouter;
