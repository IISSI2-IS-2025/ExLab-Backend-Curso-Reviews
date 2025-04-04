import { Order, Review } from '../models/models.js'

const userHasPlacedOrderInRestaurant = async (req, res, next) => {
  const userId = req.user.id
  const { restaurantId } = req.params
  const ordersCount = await Order.count({ where: { userId, restaurantId } })
  if (ordersCount === 0) {
    return res.status(409).json({ error: 'User cannot review this restaurant without completed orders.' })
  }
  next()
}

const checkCustomerHasNotReviewed = async (req, res, next) => {
  try {
    const { restaurantId } = req.params
    const customerId = req.user.id
    const existingReview = await Review.findOne({
      where: { restaurantId, customerId }
    })
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this restaurant' })
    }
    next()
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while checking reviews', error })
  }
}

const checkReviewOwnership = async (req, res, next) => {
  const review = await Review.findByPk(req.params.reviewId)
  if (review.customerId !== req.user.id) {
    return res.status(403).json({ message: 'You do not have permission to modify this review.' })
  }
  next()
}

const checkReviewBelongsToRestaurant = async (req, res, next) => {
  const { restaurantId, reviewId } = req.params

  try {
    const review = await Review.findByPk(reviewId)

    // El comparador doble es intencionado por la diferencia de tipo de datos string vs integer
    // eslint-disable-next-line eqeqeq
    if (review.restaurantId != restaurantId) {
      return res.status(409).json({ error: 'Review does not belong to the specified restaurant.' })
    }

    next()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export { checkCustomerHasNotReviewed, userHasPlacedOrderInRestaurant, checkReviewOwnership, checkReviewBelongsToRestaurant }
