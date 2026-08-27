const router = require('express').Router();
const contentController = require('../Controllers/contentController');

// Static pages
router.post('/pages', ...contentController.pageCreateValidation);
router.patch('/pages/:pageId', ...contentController.pageUpdateValidation);
router.get('/clubs/:clubId/pages', ...contentController.getPagesByClub);

// External links
router.post('/clubs/:clubId/links', ...contentController.linksUpsertValidation);
router.get('/clubs/:clubId/links', ...contentController.getLinksByClub);

module.exports = router;
