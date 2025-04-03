import { Review } from '../models/models.js'

const ReviewController = {

  async index (req, res) {
    try {
      const reviews = await Review.findAll({
        where: { restaurantId: req.params.restaurantId },
        order: [['createdAt', 'DESC']]
      })
      res.json(reviews)
    } catch (err) {
      res.status(500).send(err.message)
    }
  },

  async create (req, res) {
    try {
      const review = await Review.create({
        stars: req.body.stars,
        body: req.body.body,
        restaurantId: req.params.restaurantId,
        customerId: req.user.id
      })
      res.json(review)
    } catch (err) {
      res.status(500).send(err.message)
    }
  },

  async update (req, res) {
    try {
      const review = await Review.findByPk(req.params.reviewId)
      await review.update(req.body)
      res.json(review)
    } catch (err) {
      res.status(500).send(err.message)
    }
  },

  async destroy (req, res) {
    try {
      const result = await Review.destroy({ where: { id: req.params.reviewId } })
      let message = ''
      if (result === 1) {
        message = 'Sucessfuly deleted review id.' + req.params.reviewId
      } else {
        message = 'Could not delete review.'
      }
      res.json(message)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

}

export default ReviewController
