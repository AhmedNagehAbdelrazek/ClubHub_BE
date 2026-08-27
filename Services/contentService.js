const { StaticPage, ExternalLink } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');

/**
 * CRUD for static pages (club admin)
 */
async function createStaticPage(data, user) {
  const { clubId, type, title, contentHtml, attachmentUrl } = data;
  // Verify admin rights
  const Membership = require('../Models/Membership');
  if (user.globalRole !== 'super_admin') {
    const mem = await Membership.findOne({
      where: { user_id: user.id, club_id: clubId, club_role: 'club_admin', status: 'approved' },
    });
    if (!mem) throw ApiErrors.forbidden('Club admin access required');
  }

  return await StaticPage.create({
    club_id: clubId,
    type,
    title,
    content_html: contentHtml || null,
    attachment_url: attachmentUrl || null,
  });
}

async function updateStaticPage(pageId, data, user) {
  const page = await StaticPage.findByPk(pageId);
  if (!page) throw ApiErrors.notFound('Page not found');

  if (user.globalRole !== 'super_admin') {
    const Membership = require('../Models/Membership');
    const mem = await Membership.findOne({
      where: { user_id: user.id, club_id: page.club_id, club_role: 'club_admin', status: 'approved' },
    });
    if (!mem) throw ApiErrors.forbidden('Club admin access required');
  }

  if (data.type) page.type = data.type;
  if (data.title) page.title = data.title;
  if (data.contentHtml !== undefined) page.content_html = data.contentHtml;
  if (data.attachmentUrl !== undefined) page.attachment_url = data.attachmentUrl;
  await page.save();
  return page;
}

async function getStaticPagesByClub(clubId) {
  const pages = await StaticPage.findAll({ where: { club_id: clubId } });
  return pages;
}

/**
 * External links CRUD (club admin)
 */
async function upsertExternalLinks(clubId, links, user) {
  if (user.globalRole !== 'super_admin') {
    const Membership = require('../Models/Membership');
    const mem = await Membership.findOne({
      where: { user_id: user.id, club_id: clubId, club_role: 'club_admin', status: 'approved' },
    });
    if (!mem) throw ApiErrors.forbidden('Club admin access required');
  }

  // Delete existing and create new set for simplicity
  await ExternalLink.destroy({ where: { club_id: clubId } });

  const created = await ExternalLink.bulkCreate(
    links.map((l) => ({
      club_id: clubId,
      store_url: l.storeUrl || null,
      maps_url: l.mapsUrl || null,
      whatsapp_url: l.whatsappUrl || null,
      instagram_url: l.instagramUrl || null,
      facebook_url: l.facebookUrl || null,
      website_url: l.websiteUrl || null,
    }))
  );

  return created;
}

async function getExternalLinksByClub(clubId) {
  const links = await ExternalLink.findAll({ where: { club_id: clubId } });
  return links;
}

module.exports = {
  createStaticPage,
  updateStaticPage,
  getStaticPagesByClub,
  upsertExternalLinks,
  getExternalLinksByClub,
};
