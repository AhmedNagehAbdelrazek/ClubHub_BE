const { param, body } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware');
const contentService = require('../Services/contentService');
const { successResponse } = require('../utils/httpResponse');
const { protect } = require('../middlewares/protect');

const pageCreateValidation = [
  protect,
  body('clubId').isUUID(),
  body('type').notEmpty(),
  body('title').notEmpty(),
  body('contentHtml').optional().isString(),
  body('attachmentUrl').optional().isURL(),
  validate,
  async (req, res, next) => {
    try {
      const page = await contentService.createStaticPage(req.body, req.user);
      successResponse(res, page, 201);
    } catch (err) {
      next(err);
    }
  },
];

const pageUpdateValidation = [
  protect,
  param('pageId').isUUID(),
  body('type').optional().notEmpty(),
  body('title').optional().notEmpty(),
  body('contentHtml').optional().isString(),
  body('attachmentUrl').optional().isURL(),
  validate,
  async (req, res, next) => {
    try {
      const page = await contentService.updateStaticPage(req.params.pageId, req.body, req.user);
      successResponse(res, page, 200);
    } catch (err) {
      next(err);
    }
  },
];

const getPagesByClub = [param('clubId').isUUID(), async (req, res, next) => {
  try {
    const pages = await contentService.getStaticPagesByClub(req.params.clubId);
    successResponse(res, pages, 200);
  } catch (err) {
    next(err);
  }
}];

const linksUpsertValidation = [
  protect,
  body('links').isArray(),
  body('links.*.storeUrl').optional().isURL(),
  body('links.*.mapsUrl').optional().isURL(),
  body('links.*.whatsappUrl').optional().isURL(),
  body('links.*.instagramUrl').optional().isURL(),
  body('links.*.facebookUrl').optional().isURL(),
  body('links.*.websiteUrl').optional().isURL(),
  validate,
  async (req, res, next) => {
    try {
      const links = await contentService.upsertExternalLinks(req.params.clubId, req.body.links, req.user);
      successResponse(res, links, 200);
    } catch (err) {
      next(err);
    }
  },
];

const getLinksByClub = [param('clubId').isUUID(), async (req, res, next) => {
  try {
    const links = await contentService.getExternalLinksByClub(req.params.clubId);
    successResponse(res, links, 200);
  } catch (err) {
    next(err);
  }
}];

module.exports = {
  pageCreateValidation,
  pageUpdateValidation,
  getPagesByClub,
  linksUpsertValidation,
  getLinksByClub,
};
