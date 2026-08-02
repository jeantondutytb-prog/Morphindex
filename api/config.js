module.exports = (req, res) => {
  const config = {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    redirectAfterLogin:
      process.env.REDIRECT_AFTER_LOGIN ||
      process.env.AUTH_REDIRECT_URL ||
      ''
  };

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(`window.APP_CONFIG=${JSON.stringify(config)};`);
};
