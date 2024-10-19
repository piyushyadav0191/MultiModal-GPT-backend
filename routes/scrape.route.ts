import { Router } from "express";
import { ScrapeController } from "../controller/scrape.controller";

const ScrapeRouter = Router()

ScrapeRouter.post("/scrape",ScrapeController)

export default ScrapeRouter