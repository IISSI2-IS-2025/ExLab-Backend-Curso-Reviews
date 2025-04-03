module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bcrypt = require('bcryptjs')
    const salt = bcrypt.genSaltSync(5)

    await queryInterface.bulkInsert('Reviews', [
      {
        stars: 4,
        body: 'La comida llegó caliente y estaba muy buena. Repetiré seguro.',
        restaurantId: 1,
        customerId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        stars: 5,
        body: 'Todo genial, buen servicio y productos deliciosos.',
        restaurantId: 2,
        customerId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {})
    await queryInterface.bulkInsert('Users', [
      { id: 101, firstName: 'Review Tester', lastName: 'Customer', email: 'reviewtester@customer.com', password: bcrypt.hashSync('secret', salt), phone: '+3466655443', address: 'Review Street 123', postalCode: '41020', userType: 'customer', avatar: process.env.AVATARS_FOLDER + '/maleAvatar.png' },
      { id: 102, firstName: 'Review Tester 2', lastName: 'Customer', email: 'reviewtester2@customer.com', password: bcrypt.hashSync('secret', salt), phone: '+3466655443', address: 'Review Street 123', postalCode: '41020', userType: 'customer', avatar: process.env.AVATARS_FOLDER + '/maleAvatar.png' },
      { id: 103, firstName: 'Review Test Owner', lastName: 'Owner', email: 'reviewowner@owner.com', password: bcrypt.hashSync('secret', salt), phone: '+3466655444', address: 'Owner Street 321', postalCode: '41002', userType: 'owner', avatar: process.env.AVATARS_FOLDER + '/maleAvatar.png' }
    ], {})

    await queryInterface.bulkInsert('Restaurants', [
      { id: 101, name: 'Review Test Restaurant', address: 'Review Avenue 1', postalCode: '41002', shippingCosts: 2, restaurantCategoryId: 1, userId: 103 },
      { id: 102, name: 'Duplicate Review Test Restaurant', address: 'Review Avenue 1', postalCode: '41002', shippingCosts: 2, restaurantCategoryId: 1, userId: 103 },
      { id: 103, name: 'Another Review Test Restaurant', address: 'Review Avenue 1', postalCode: '41002', shippingCosts: 2, restaurantCategoryId: 1, userId: 103 }

    ], {})

    await queryInterface.bulkInsert('Products',
      [
        { id: 9999, name: 'Ensaladilla', description: 'Tuna salad with mayonnaise', price: 2.5, image: process.env.PRODUCTS_FOLDER + '/ensaladilla.jpeg', order: 1, availability: true, restaurantId: 101, productCategoryId: 1 },
        { id: 10000, name: 'Ensaladilla2', description: 'Tuna salad with mayonnaise', price: 2.5, image: process.env.PRODUCTS_FOLDER + '/ensaladilla.jpeg', order: 1, availability: true, restaurantId: 102, productCategoryId: 1 },
        { id: 10001, name: 'Ensaladilla2', description: 'Tuna salad with mayonnaise', price: 2.5, image: process.env.PRODUCTS_FOLDER + '/ensaladilla.jpeg', order: 1, availability: true, restaurantId: 103, productCategoryId: 1 }

      ], {})

    await queryInterface.bulkInsert('Orders', [
      { id: 101, price: 25.0, address: 'Review Street 123', shippingCosts: 2, restaurantId: 101, userId: 101, startedAt: new Date(), sentAt: new Date(), deliveredAt: new Date() },
      { id: 102, price: 25.0, address: 'Review Street 123', shippingCosts: 2, restaurantId: 101, userId: 102, startedAt: new Date(), sentAt: new Date(), deliveredAt: new Date() },
      { id: 103, price: 25.0, address: 'Review Street 123', shippingCosts: 2, restaurantId: 102, userId: 1, startedAt: new Date(), sentAt: new Date(), deliveredAt: new Date() },
      { id: 104, price: 25.0, address: 'Review Street 123', shippingCosts: 2, restaurantId: 103, userId: 1, startedAt: new Date(), sentAt: new Date(), deliveredAt: new Date() }

    ], {})

    await queryInterface.bulkInsert('OrderProducts', [
      { orderId: 101, productId: 9999, unityPrice: 5.0, quantity: 5 },
      { orderId: 102, productId: 9999, unityPrice: 5.0, quantity: 5 },
      { orderId: 103, productId: 10000, unityPrice: 3.0, quantity: 5 },
      { orderId: 104, productId: 10001, unityPrice: 2.0, quantity: 5 }

    ], {})

    await queryInterface.bulkInsert('Reviews', [
      { id: 9999, stars: 4, body: 'Good food', restaurantId: 101, customerId: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 10000, stars: 5, body: 'Excellent!', restaurantId: 101, customerId: 102, createdAt: new Date(), updatedAt: new Date() }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface
    try {
      await sequelize.transaction(async (transaction) => {
        const options = { transaction }
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', options)
        await sequelize.query('TRUNCATE TABLE Reviews', options)
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', options)
      })
    } catch (error) {
      console.error(error)
    }
  }
}
