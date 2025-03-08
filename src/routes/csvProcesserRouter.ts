import { Router } from "express";
import multer from "multer";
import CSVProcessorController from "../controllers/CSVProcessorController";

const upload = multer();
const csvProcesserRotuer = Router();

csvProcesserRotuer.post(
  "/upload",
  upload.single("file"),
  CSVProcessorController.uploadCSV
);
csvProcesserRotuer.get("/status/:requestId", CSVProcessorController.getStatus);
csvProcesserRotuer.get(
  "/download/:requestId",
  CSVProcessorController.downloadOutputCSV
);
export default csvProcesserRotuer;
