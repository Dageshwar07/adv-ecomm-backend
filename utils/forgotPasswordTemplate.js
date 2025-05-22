 const forgotPasswordTemplate = ({ name, otp }) => {
    return `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color: green;">Hello ${name},</h2>
        <p>You requested to reset your password. Use the OTP below to proceed:</p>
           <div style="margin: 20px 0; padding: 15px; background-color: #f1f1f1; border-left: 5px solid green; font-size: 24px; font-weight: bold;">
          ${otp}
        </div>
        <p>This OTP is valid for 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;
  }
  export { forgotPasswordTemplate };