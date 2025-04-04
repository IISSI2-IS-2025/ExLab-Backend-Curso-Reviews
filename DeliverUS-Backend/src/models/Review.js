import { Model } from 'sequelize'

const loadModel = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate (models) {
      Review.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' })
      Review.belongsTo(models.User, { foreignKey: 'customerId', as: 'customer' }) // se admite as: user
    }
  }

  Review.init({
    stars: {
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: { // no penalizar
        min: 0,
        max: 5
      }
    },
    body: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    restaurantId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Restaurants',
        key: 'id'
      }
    },
    customerId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Review'
  })

  return Review
}

export default loadModel
