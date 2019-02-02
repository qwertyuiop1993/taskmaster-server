const requireCredit = (req, res, next) => {
  if (req.user.credits > 0) {
    return next();
  }
  res.status(403).send({ error: "Not enough credits" });
};

module.exports = requireCredit;
