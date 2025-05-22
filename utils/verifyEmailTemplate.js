const verifyEmailTemplate = ({ name, otp, url }) => {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: green;">Hi ${name}, Please Verify Your Email Address</h2>
        
        <p>Thank you for registering with <strong>Ecommerce App</strong>. Please use the OTP below to verify your email address:</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f1f1f1; border-left: 5px solid green; font-size: 24px; font-weight: bold;">
          ${otp}
        </div>
  
        <p>Or you can click the button below to verify your email directly:</p>
        <a href="${url}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: green; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
  
        <p style="margin-top: 30px;">If you didn’t create an account, you can safely ignore this email.</p>
  
        <p style="margin-top: 40px; color: #888;">© ${new Date().getFullYear()} Ecommerce App. All rights reserved.</p>
      </div>
    `;
  };
  
  export  {verifyEmailTemplate};
  