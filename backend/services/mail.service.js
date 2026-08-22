import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // 使用 Gmail SMTP 服務
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

export const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"孕產婦健康照護管理系統" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} is your verification code`, 

    text: `
    ${otp} is your verification code

    ${otp}

    This code will expire in 5 minutes.

    您的驗證碼為 ${otp}
    5分鐘內有效
    `.trim(),

    html: `
    <table width="100%" bgcolor="#f6f9fc" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">

          <table width="600" bgcolor="#ffffff" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;">
            <tr>
              <td align="center" style="padding:40px 20px; font-family: Arial, sans-serif;">

                <h2 style="color:#4A90E2;">孕產婦健康照護管理系統</h2>

                <p>Your verification code is:</p>
                <p>您的驗證碼為 </p>

                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td bgcolor="#f8f9fa" style="padding:15px 30px;">
                      <span style="font-size:42px; font-weight:bold; color:#d93025;">
                        ${otp}
                      </span>
                    </td>
                  </tr>
                </table>

                <p>Valid for 5 minutes</p>
                <p>5分鐘內有效</p>

              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  `,
  });
};