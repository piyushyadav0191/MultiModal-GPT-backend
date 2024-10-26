import dotenv from "dotenv";
dotenv.config();
import type { Request, Response } from "express";
const {
  imageClassifyController,
} = require("../controller/image-classify.controller");
const fs = require("fs");
const { getGroqCompletion } = require("../config/groq-completion");
const { addToVectorStore } = require("../lib/add-to-vector");

jest.mock("fs");
jest.mock("../config/groq-completion");
jest.mock("../lib/add-to-vector");

describe("imageClassifyController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    req = {
      file: {
        path: "/path/to/image.jpg",
        originalname: "image.jpg",
        fieldname: "file",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 12345,
        buffer: Buffer.from(""),
        stream: fs.createReadStream("/path/to/image.jpg"),
        destination: "/path/to",
        filename: "image.jpg",
      },
    };
    res = {
      status: statusMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if no file is uploaded", async () => {
    req.file = undefined;

    await imageClassifyController(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "No Image file uploaded",
    });
  });

  it("should return 500 if there is an error processing the image", async () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("File read error");
    });

    await imageClassifyController(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Error processing image",
    });
  });

  it("should process the image and return the response content", async () => {
    const mockImageBuffer = Buffer.from("mockImageData");
    const mockResponseContent = { result: "mockResult" };

    (fs.readFileSync as jest.Mock).mockReturnValue(mockImageBuffer);
    (getGroqCompletion as jest.Mock).mockResolvedValue(mockResponseContent);
    (addToVectorStore as jest.Mock).mockResolvedValue(undefined);

    await imageClassifyController(req as Request, res as Response);

    expect(fs.readFileSync).toHaveBeenCalledWith("/path/to/image.jpg");
    expect(getGroqCompletion).toHaveBeenCalledWith(
      expect.any(Array),
      "llama-3.2-11b-vision-preview"
    );
    expect(addToVectorStore).toHaveBeenCalledWith(mockResponseContent, {
      source: "image.jpg",
      type: "image_classification",
    });
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({ response: mockResponseContent });
  });
});
