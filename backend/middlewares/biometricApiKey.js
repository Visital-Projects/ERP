module.exports = function biometricApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key missing",
    });
  }

  if (apiKey !== process.env.BIOMETRIC_API_KEY) {
    return res.status(403).json({
      success: false,
      message: "Invalid API key",
    });
  }

  // 🔐 Mark request as biometric trusted
  req.isBiometric = true;

  next();
};
