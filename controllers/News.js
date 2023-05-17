import News from "../models/NewsModel.js";
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

export const getNews = async (req, res) => {
  try {
    const id = req.params.id;
    const news = await News.findOne({
      where: {
        id: id,
      },
    });
    news.newsImageUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: news.newsImage,
      }),
      { expiresIn: 60 }
    );
    res.json(news);
  } catch (err) {
    console.error(err);
  }
};

export const getNewsOfThisType = async (req, res) => {
  try {
    const offset = parseInt(req.params.offset) || 0;
    const limit = parseInt(req.params.limit) || 5;

    const news = await News.findAll({
      attributes: [
        "id",
        "newsName",
        "newsImage",
        "newsImageUrl",
        "newsDescription",
      ],
      offset: offset,
      limit: limit,
    });
    for (let n of news) {
      n.newsImageUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: n.newsImage,
        }),
        { expiresIn: 60 }
      );
    }
    res.json(news);
  } catch (err) {
    console.error(err);
  }
};

export const getAllNews = async (req, res) => {
  try {
    const allNews = await News.findAll({
      attributes: [
        "id",
        "newsName",
        "newsImage",
        "newsImageUrl",
        "newsDescription",
      ],
    });

    for (let news of allNews) {
      news.newsImageUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: news.newsImage,
        }),
        { expiresIn: 60 }
      );
    }
    res.json(allNews);
  } catch (err) {
    console.error(err);
  }
};

export const deleteNews = async (req, res) => {
  try {
    const id = req.params.id;
    const news = await News.findOne({
      where: {
        id: id,
      },
    });

    const deleteParams = {
      Bucket: bucketName,
      Key: news.newsImage,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    await News.destroy({
      where: {
        id: id,
      },
    });
  } catch (err) {
    console.error(err);
  }
};



export const addNews = async (req, res) => {
  try {
    const { name, description } = req.body;
    const file = req.files[0];

    const fileBuffer = await sharp(file.buffer)
      .resize({ height: 1080, width: 1920, fit: "contain" })
      .toBuffer();

    const fileName = generateFileName();

    const uploadParams = {
      Bucket: bucketName,
      Body: fileBuffer,
      Key: fileName,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    await News.create({
      newsName: name,
      newsImage: fileName,
      newsDescription: description,
    });
  } catch (err) {
    console.error(err);
  }
};
