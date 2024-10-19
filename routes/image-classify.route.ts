import { Router } from "express";
import { imageClassifyController } from "../controller/image-classify.controller";
import { upload } from "../config/multer-config";

const ImageClassifyRouter = Router()

ImageClassifyRouter.post("/image-classify",upload.single("image"),imageClassifyController)

export default ImageClassifyRouter