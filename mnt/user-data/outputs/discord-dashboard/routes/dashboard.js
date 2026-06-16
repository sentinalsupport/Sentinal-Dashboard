app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here-change-this',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'native',
    }),
    cookie: {
      secure: false,          // ✅ Allow HTTP (Render uses HTTP internally)
      httpOnly: true,         // ✅ Security
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: 'none',       // ✅ Allow cross-site (Discord → Render)
      // domain: '.onrender.com', // ❌ REMOVE THIS - causes issues!
    },
  })
);
