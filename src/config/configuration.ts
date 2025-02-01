
export default () => ({
   port: parseInt(process.env.PORT, 10) || 8050,
   database: {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432
   },
   S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
   S3_REGION: process.env.S3_REGION,
   S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
   S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
   S3_END_POINT: process.env.S3_END_POINT,

   s3: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,

      endpoint: process.env.S3_END_POINT,
      region: process.env.S3_REGION,

      bucket: process.env.S3_BUCKET_NAME,
      acl: 'public-read',
      basePath: 'her-converstion',
   },

   token_purpose: {
      forgot_password: 'forgot_password',
      reset_password: 'reset_password',
      email_verification: 'email_verification'
   },
   mail_transport: {
      host: process.env.MAIL_SMTP,
      port: 587,
      secure: false,
      auth: {
         user: process.env.MAIL_USERNAME,
         pass: process.env.MAIL_PASSWORD,
      },
   },
   send_email_verification_mail: {
      form_email: 'arupmaity079@gmail.com',
      form_name: 'Arup Maity'
   },
   app_url: 'http://localhost:3001/'
});
