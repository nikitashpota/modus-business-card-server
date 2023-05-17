import express from "express";
import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getProject,
  getProjectsOfThisType,
} from "../controllers/Projects.js";
import {
  addNews,
  deleteNews,
  getAllNews,
  getNews,
  getNewsOfThisType,
} from "../controllers/News.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.get("/api/getProjects", getProjects);
router.get(
  "/api/getProjectsOfThisType/:type/:offset/:limit",
  getProjectsOfThisType
);
router.post("/api/addProject", upload.any("images"), addProject);
router.put("/api/updateProject", upload.any("images"), updateProject);
router.delete("/api/deleteProject/:id", deleteProject);
router.get("/api/getProject/:id", getProject);
router.get("/api/getAllNews", getAllNews);
router.get("/api/getNews/:id", getNews);
router.get("/api/getNewsOfThisType/:offset/:limit", getNewsOfThisType);
router.delete("/api/deleteNews/:id", deleteNews);
router.post("/api/addNews", upload.any("images"), addNews);

export default router;
