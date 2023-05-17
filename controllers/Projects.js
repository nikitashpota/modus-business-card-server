import Projects from "../models/ProjectModel.js";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import crypto from "crypto";
import sharp from "sharp";

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");
dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const getProject = async (req, res) => {
  try {
    const id = req.params.id;
    const project = await Projects.findOne({
      where: {
        id: id,
      },
    });

    const projectImageUrls = [];
    project.projectImageUrls = "";
    if (project.projectImages) {
      const projectNamesImages = project.projectImages.split(",");

      for (let i in projectNamesImages) {
        const name = projectNamesImages[i];

        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: name,
          }),
          { expiresIn: 60 } // 60 seconds
        );
        if (url) projectImageUrls.push(url);
      }

      project.projectImageUrls = projectImageUrls.join(",");
    }
    res.json(project);
  } catch (err) {
    console.error(err);
  }
};

export const getProjectsOfThisType = async (req, res) => {
  try {
    const type = req.params.type;
    const offset = parseInt(req.params.offset) || 0;
    const limit = parseInt(req.params.limit) || 5;

    const projects = await Projects.findAll({
      attributes: [
        "id",
        "projectName",
        "projectImage",
        "projectImageUrl",
        "projectType",
      ],
      where: { projectType: type },
      offset: offset,
      limit: limit,
    });
    for (let project of projects) {
      project.projectImageUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: project.projectImage,
        }),
        { expiresIn: 60 }
      );
    }
    res.json(projects);
  } catch (err) {
    console.error(err);
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Projects.findAll({
      attributes: [
        "id",
        "projectName",
        "projectImage",
        "projectImageUrl",
        "projectType",
      ],
    });

    for (let project of projects) {
      project.projectImageUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: project.projectImage,
        }),
        { expiresIn: 60 } // 60 seconds
      );
    }
    res.json(projects);
  } catch (err) {
    console.error(err);
  }
};

export const addProject = async (req, res) => {
  try {
    const { name, authors, description, type } = req.body;
    const files = req.files;
    const projectImages = [];
    let fileNameImageMain = "";

    for (let i in files) {
      const file = files[i];

      let fileBuffer = null;

      const fileName = generateFileName();
      if (file.fieldname == "uploadImages") {
        fileBuffer = await sharp(file.buffer)
          .resize({ height: 1080, width: 1920, fit: "contain" })
          .toBuffer();

        projectImages.push(fileName);
      } else {
        fileBuffer = await sharp(file.buffer)
          .resize({ height: 1080, width: 520, fit: "contain" })
          .toBuffer();
        fileNameImageMain = fileName;
      }

      const uploadParams = {
        Bucket: bucketName,
        Body: fileBuffer,
        Key: fileName,
        ContentType: file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
    }

    await Projects.create({
      projectName: name,
      projectType: type,
      projectImage: fileNameImageMain,
      projectImages: projectImages.join(","),
      projectAuthors: authors,
      projectDescription: description,
    });
  } catch (err) {
    console.error(err);
  }
};

export const deleteProject = async (req, res) => {
  try {
    const id = req.params.id;

    const project = await Projects.findOne({
      where: {
        id: id,
      },
    });

    const deleteParams = {
      Bucket: bucketName,
      Key: project.projectImage,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    for (let image of project.projectImages.split(",")) {
      const deleteParams = {
        Bucket: bucketName,
        Key: image,
      };
      await s3Client.send(new DeleteObjectCommand(deleteParams));
    }

    await Projects.destroy({
      where: {
        id: id,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id, name, image, images, authors, description } = req.body;
    const project = await Projects.findAll({
      where: {
        id: id,
      },
    });
    project.projectName = name;
    project.projectImage = image;
    project.projectImages = images;
    project.projectAuthors = authors;
    project.projectDescription = description;

    await project.save();
  } catch (err) {
    console.error(err);
  }
};
