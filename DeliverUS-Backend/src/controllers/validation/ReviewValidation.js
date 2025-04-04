import { check } from 'express-validator'

const create = [
  check('stars')
    .exists().withMessage('Stars rating is required')
    .isInt({ min: 0, max: 5 }).withMessage('Stars must be an integer between 0 and 5').toInt(),
  check('body')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
]

const update = [
  check('stars')
    .exists().withMessage('Stars rating is required')
    .isInt({ min: 0, max: 5 }).withMessage('Stars must be an integer between 0 and 5').toInt(),
  check('body')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
]

export { create, update }
