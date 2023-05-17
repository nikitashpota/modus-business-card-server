import express from "express";
import router from "./routes/Routes.js";
import multer from "multer";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
const app = express();
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3001;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

upload.single("image");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(router);

app.listen(port, () => {
  console.log(`Сервер настроен на ${port}`);
});
