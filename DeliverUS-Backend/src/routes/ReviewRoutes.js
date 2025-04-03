import ReviewController from '../controllers/ReviewController.js'
import * as ReviewValidation from '../controllers/validation/ReviewValidation.js'
import { isLoggedIn, hasRole } from '../middlewares/AuthMiddleware.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import { Restaurant, Review } from '../models/models.js'
import { userHasPlacedOrderInRestaurant, checkReviewOwnership, checkReviewBelongsToRestaurant, checkCustomerHasNotReviewed } from '../middlewares/ReviewMiddleware.js'

const loadReviewRoutes = function (app) {

}

export default loadReviewRoutes
