const db = require('../db');
const { asyncHandler } = require('../utils/http');

const getUserNfts = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const { rows } = await db.query(
    `
      SELECT
        no.*,
        nd.name,
        nd.description,
        nd.image_url,
        nd.nft_type,
        nd.rarity_color
      FROM nft_ownership no
      INNER JOIN nft_definitions nd ON nd.id = no.nft_def_id
      WHERE no.owner_id = $1
      ORDER BY no.acquired_at DESC
    `,
    [userId]
  );

  res.status(200).json({
    nfts: rows,
  });
});

module.exports = {
  getUserNfts,
};
