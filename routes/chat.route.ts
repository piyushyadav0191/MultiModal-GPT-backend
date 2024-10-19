import { Router } from "express";
import { ChatController } from "../controller/chat.controller";

const ChatRouter = Router()

ChatRouter.post("/chat",ChatController)

export default ChatRouter