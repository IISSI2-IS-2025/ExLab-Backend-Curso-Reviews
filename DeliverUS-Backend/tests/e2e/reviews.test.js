import dotenv from 'dotenv'
import request from 'supertest'
import { getLoggedInCustomer, getNewLoggedInCustomer, getLoggedInOwner } from './utils/auth'
import { getApp, shutdownApp } from './utils/testApp'
import { createRestaurant, getFirstRestaurantOfOwner } from './utils/restaurant'
dotenv.config()

describe('Review E2E tests', () => {
  let app, customer, owner, restaurant, review, casaFelix, restaurantWithNoReviewsId

  beforeAll(async () => {
    app = await getApp()
    customer = await getLoggedInCustomer()
    owner = await getLoggedInOwner()
    casaFelix = await getFirstRestaurantOfOwner(owner)
    restaurant = await createRestaurant(owner)
    restaurantWithNoReviewsId = 102
  })

  describe('Get restaurant reviews', () => {
    let app, restaurantIdWithReviews, restaurantIdWithoutReviews, response

    beforeAll(async () => {
      app = await getApp()

      restaurantIdWithReviews = casaFelix.id

      // Restaurante sin reviews (creamos uno nuevo)
      const owner = await getLoggedInOwner()
      const restaurant = await createRestaurant(owner)
      restaurantIdWithoutReviews = restaurant.id
    })

    it('Should return 404 when restaurant does not exist', async () => {
      response = await request(app).get('/restaurants/9999/reviews').send()
      expect(response.status).toBe(404)
    })

    it('Should return 200 with empty array when restaurant has no reviews', async () => {
      response = await request(app).get(`/restaurants/${restaurantIdWithoutReviews}/reviews`).send()
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body).toHaveLength(0)
    })

    it('Should return 200 with reviews when restaurant has reviews', async () => {
      response = await request(app).get(`/restaurants/${restaurantIdWithReviews}/reviews`).send()
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body.length).toBeGreaterThan(0)

      const review = response.body[0]
      expect(review.id).toBeDefined()
      expect(review.stars).toBeDefined()
      expect(typeof review.stars).toBe('number')
      expect(review.body).toBeDefined()
      expect(typeof review.body).toBe('string')
      expect(review.customerId).toBeDefined()
      expect(review.restaurantId).toBe(restaurantIdWithReviews)
      expect(review.createdAt).toBeDefined()
      expect(review.updatedAt).toBeDefined()
    })

    afterAll(async () => {
      await shutdownApp()
    })
  })

  describe('POST /restaurants/:restaurantId/reviews', () => {
    const validReview = {
      stars: 5,
      body: 'Great food!'
    }

    it('should return 401 if customer is not logged in', async () => {
      const response = await request(app)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .send(validReview)
      expect(response.status).toBe(401)
    })

    it('should return 403 if logged as owner', async () => {
      const response = await request(app)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send(validReview)
      expect(response.status).toBe(403)
    })

    it('should return 404 if invalid restaurantId', async () => {
      const newCustomer = await getNewLoggedInCustomer()
      const response = await request(app)
        .post('/restaurants/invalidId/reviews')
        .set('Authorization', `Bearer ${newCustomer.token}`)
        .send(validReview)
      expect(response.status).toBe(404)
    })

    it('should return 409 if customer has no orders', async () => {
      const newCustomer = await getNewLoggedInCustomer()
      const response = await request(app)
        .post(`/restaurants/${restaurant.id}/reviews`)
        .set('Authorization', `Bearer ${newCustomer.token}`)
        .send(validReview)
      expect(response.status).toBe(409)
    })

    it('should return 422 with invalid stars', async () => {
      const invalidReview = { stars: 7, body: 'Awesome!' }
      const response = await request(app)
        .post(`/restaurants/${restaurantWithNoReviewsId}/reviews`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send(invalidReview)
      expect(response.status).toBe(422)
    })

    it('should return 422 with negative stars', async () => {
      const invalidReview = { stars: -1, body: 'Awesome!' }
      const response = await request(app)
        .post(`/restaurants/${restaurantWithNoReviewsId}/reviews`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send(invalidReview)
      expect(response.status).toBe(422)
    })

    it('should return 422 without stars', async () => {
      const invalidReview = { body: 'Awesome!' }
      const response = await request(app)
        .post(`/restaurants/${restaurantWithNoReviewsId}/reviews`).set('Authorization', `Bearer ${customer.token}`)
        .send(invalidReview)
      expect(response.status).toBe(422)
    })

    it('should create review when data is valid', async () => {
      const response = await request(app)
        .post('/restaurants/103/reviews')
        .set('Authorization', `Bearer ${customer.token}`)
        .send(validReview)
      expect(response.status).toBe(200)
      expect(response.body.stars).toBe(validReview.stars)
      expect(response.body.body).toBe(validReview.body)
      review = response.body
    })

    it('should create review when data only contains stars', async () => {
      const reviewWithoutBody = { stars: 0 }
      const response = await request(app)
        .post(`/restaurants/${restaurantWithNoReviewsId}/reviews`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send(reviewWithoutBody)
      expect(response.status).toBe(200)
      expect(response.body.stars).toBe(reviewWithoutBody.stars)
      expect(response.body.body).toBeUndefined()
      review = response.body
    })

    it('should return 409 if customer has already reviewed the restaurant', async () => {
      const duplicateReview = { stars: 4, body: 'Another review attempt' }

      // El cliente intenta crear una segunda review en el mismo restaurante
      const response = await request(app)
        .post(`/restaurants/${restaurantWithNoReviewsId}/reviews`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send(duplicateReview)

      expect(response.status).toBe(409)
    })
  })

  describe('PUT /restaurants/:restaurantId/reviews/:reviewId', () => {
    it('should return 401 if not logged in', async () => {
      const response = await request(app)
        .put(`/restaurants/${review.restaurantId}/reviews/${review.id}`)
        .send({ stars: 4, body: 'Updated Review' })
      expect(response.status).toBe(401)
    })
    it('should return 403 if logged as owner', async () => {
      const response = await request(app)
        .put(`/restaurants/${review.restaurantId}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ stars: 5, body: 'Updated' })
      expect(response.status).toBe(403)
    })

    it('should return 403 if logged as another customer', async () => {
      const anotherCustomer = await getNewLoggedInCustomer()
      const response = await request(app)
        .put(`/restaurants/${review.restaurantId}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${anotherCustomer.token}`)
        .send({ stars: 5, body: 'Updated' })
      expect(response.status).toBe(403)
    })

    it('should return 404 if invalid restaurantId', async () => {
      const response = await request(app)
        .put(`/restaurants/invalidId/reviews/${review.id}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ stars: 5, body: 'Updated' })
      expect(response.status).toBe(404)
    })

    it('should return 404 if invalid reviewId', async () => {
      const anotherRestaurant = await createRestaurant(owner)
      const response = await request(app)
        .put(`/restaurants/${anotherRestaurant.id}/reviews/invalidId`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ stars: 5, body: 'Updated' })
      expect(response.status).toBe(404)
    })

    it('should return 409 if review does not belong to restaurant', async () => {
      const anotherRestaurant = await createRestaurant(owner)
      const response = await request(app)
        .put(`/restaurants/${anotherRestaurant.id}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ stars: 5, body: 'Updated' })
      expect(response.status).toBe(409)
    })

    it('should not update review with negative stars', async () => {
      const response = await request(app)
        .put(`/restaurants/${review.restaurantId}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ stars: -1, body: 'Updated review body' })
      expect(response.status).toBe(422)
    })

    it('should not update review with invalid stars', async () => {
      const response = await request(app)
        .put(`/restaurants/${review.restaurantId}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ stars: 6, body: 'Updated review body' })
      expect(response.status).toBe(422)
    })

    it('should not update review without stars', async () => {
      const response = await request(app)
        .put(`/restaurants/${review.restaurantId}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ body: 'Updated review body' })
      expect(response.status).toBe(422)
    })

    it('should update review when data is valid', async () => {
      const response = await request(app)
        .put(`/restaurants/${review.restaurantId}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ stars: 5, body: 'Updated review body' })
      expect(response.status).toBe(200)
      expect(response.body.stars).toBe(5)
      expect(response.body.body).toBe('Updated review body')
    })

    it('should update review when stars is 0', async () => {
      const response = await request(app)
        .put(`/restaurants/${review.restaurantId}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ stars: 0, body: 'Updated review body' })
      expect(response.status).toBe(200)
      expect(response.body.stars).toBe(0)
      expect(response.body.body).toBe('Updated review body')
    })
  })

  describe('DELETE /restaurants/:restaurantId/reviews/:reviewId', () => {
    it('should return 401 if not logged in', async () => {
      const response = await request(app)
        .delete(`/restaurants/${restaurant.id}/reviews/${review.id}`)
      expect(response.status).toBe(401)
    })
    it('should return 403 if deleting review as owner', async () => {
      const response = await request(app)
        .delete(`/restaurants/${casaFelix.id}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
      expect(response.status).toBe(403)
    })

    it('should return 403 if deleting another customer review', async () => {
      const anotherCustomer = await getNewLoggedInCustomer()
      const response = await request(app)
        .delete(`/restaurants/${review.restaurantId}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${anotherCustomer.token}`)
      expect(response.status).toBe(403)
    })

    it('should return 404 if invalid restaurantId', async () => {
      const response = await request(app)
        .delete(`/restaurants/invalidId/reviews/${review.id}`)
        .set('Authorization', `Bearer ${customer.token}`)
      expect(response.status).toBe(404)
    })

    it('should return 404 if invalid reviewId', async () => {
      const response = await request(app)
        .delete(`/restaurants/${casaFelix.id}/reviews/invalidId`)
        .set('Authorization', `Bearer ${customer.token}`)
      expect(response.status).toBe(404)
    })

    it('should return 409 if review does not belong to restaurant', async () => {
      const anotherRestaurant = await createRestaurant(owner)
      const response = await request(app)
        .delete(`/restaurants/${anotherRestaurant.id}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${customer.token}`)
      expect(response.status).toBe(409)
    })

    it('should delete own review successfully', async () => {
      const response = await request(app)
        .delete(`/restaurants/${review.restaurantId}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${customer.token}`)
      expect(response.status).toBe(200)
    })

    it('should return 404 if review was already deleted', async () => {
      const response = await request(app)
        .delete(`/restaurants/${review.restaurantId}/reviews/${review.id}`)
        .set('Authorization', `Bearer ${customer.token}`)
      expect(response.status).toBe(404)
    })
  })

  afterAll(async () => {
    await shutdownApp()
  })

  describe('Restaurant avgStars computation', () => {
    let app, owner

    beforeAll(async () => {
      app = await getApp()
    })

    it('should return avgStars correctly calculated', async () => {
      const response = await request(app).get('/restaurants/101').send()
      expect(response.status).toBe(200)
      expect(response.body.avgStars).toBeDefined()
      expect(response.body.avgStars).toBe(4.5)
    })

    it('should return undefined avgStars if no reviews', async () => {
      const restaurantWithoutReviews = await createRestaurant(owner)
      const response = await request(app).get(`/restaurants/${restaurantWithoutReviews.id}`).send()
      expect(response.status).toBe(200)
      expect(response.body.avgStars).toBeFalsy()
    })

    afterAll(async () => {
      await shutdownApp()
    })
  })
})
