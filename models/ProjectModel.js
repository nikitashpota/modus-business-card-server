import { DataTypes } from "sequelize";
import modus_business_db from "../config/Database.js";

const Projects = modus_business_db.define("projects", {
  projectName: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  projectType: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  projectImage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  projectImageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  projectImageUrls: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  projectImages: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  projectAuthors: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  projectDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

(async () => {
  await modus_business_db.sync();
})();

export default Projects;
