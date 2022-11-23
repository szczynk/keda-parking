const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Park extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }
  }
  Park.init(
    {
      plat: { type: DataTypes.STRING, allowNull: false },
      tipe: { type: DataTypes.STRING, allowNull: false },
      masuk: { type: DataTypes.DATE, allowNull: false },
      keluar: { type: DataTypes.DATE, allowNull: false },
      harga: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Park',
    }
  );
  return Park;
};
