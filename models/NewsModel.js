import { DataTypes } from "sequelize";
import modus_business_db from "../config/Database.js";

const News = modus_business_db.define("news", {
  newsName: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  newsImage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  newsImageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  newsDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

(async () => {
  await modus_business_db.sync();
})();

export default News;
