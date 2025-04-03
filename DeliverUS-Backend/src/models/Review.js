import { Model } from 'sequelize'

const loadModel = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate (models) {

    }
  }

  Review.init({

  }, {
    sequelize,
    modelName: 'Review'
  })

  return Review
}

export default loadModel
