module.exports = {
  port: 8080,
  db: {
    database: process.env.DB_NAME || 'YueBa',
    user: process.env.DB_USER || 'YueBa',
    password: process.env.DB_PASSWD || 'YueBa',
    options: {
      dialect: process.env.DIALECT || 'mysql',
      host: process.env.HOST || 'mysql',
      port: process.env.PORT || '3306'
    }
  },
  authServiceToken: {
    secretKey: process.env.SECRET || 'secret'
  }
}
