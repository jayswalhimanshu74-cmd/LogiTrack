package com.example.sales.Inventory.Management.System.email;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.reset-password-url:http://localhost:5173/reset-password}")
    private String resetPasswordUrl;

    @Value("${app.verify-email-url:http://localhost:5173/verify-email}")
    private String verifyEmailUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetPasswordEmail(String toEmail, String token, int expiryMinutes) {
        String resetLink = resetPasswordUrl + "?token=" + token;
        log.info("DEVELOPER ALERT (Reset Link): {}", resetLink);
        String subject = "Password Reset Request";
        String body = String.format(
                "Hello,\n\n" +
                "A password reset request was received for your account.\n\n" +
                "Click the link below to reset your password:\n" +
                "%s\n\n" +
                "This link will expire after %d minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "StockMAster Team",
                resetLink, expiryMinutes
        );

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Password reset email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}. Error: {}", toEmail, e.getMessage());
        }
    }

    public void sendVerificationEmail(String toEmail, String token, int expiryHours) {
        String verifyLink = verifyEmailUrl + "?token=" + token;
        log.info("DEVELOPER ALERT (Verification Link): {}", verifyLink);
        String subject = "Verify Your Email Address";
        String body = String.format(
                "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <title>Email Verification</title>\n" +
                "    <style>\n" +
                "        body { font-family: 'Inter', sans-serif; background-color: #f4f5f7; color: #333333; margin: 0; padding: 0; }\n" +
                "        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e1e4e8; }\n" +
                "        .header { background: linear-gradient(135deg, #4f46e5 0%%, #7c3aed 100%%); padding: 30px; text-align: center; color: #ffffff; }\n" +
                "        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }\n" +
                "        .content { padding: 40px 30px; line-height: 1.6; }\n" +
                "        .button-container { text-align: center; margin: 30px 0; }\n" +
                "        .btn { background: linear-gradient(135deg, #4f46e5 0%%, #7c3aed 100%%); color: #ffffff !important; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15); }\n" +
                "        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; background-color: #f9fafb; border-top: 1px solid #f3f4f6; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"header\">\n" +
                "            <h1>Welcome to StockMAster</h1>\n" +
                "        </div>\n" +
                "        <div class=\"content\">\n" +
                "            <p>Hello,</p>\n" +
                "            <p>Thank you for registering with StockMAster. To complete your registration and activate your account, please click the button below to verify your email address:</p>\n" +
                "            <div class=\"button-container\">\n" +
                "                <a href=\"%s\" class=\"btn\" style=\"color: #ffffff;\">Verify Email Address</a>\n" +
                "            </div>\n" +
                "            <p>This verification link will expire in <strong>%d hours</strong>.</p>\n" +
                "            <p>If the button above does not work, copy and paste the following URL into your browser:</p>\n" +
                "            <p style=\"word-break: break-all; color: #4f46e5;\">%s</p>\n" +
                "            <p>If you did not create a StockMAster account, please ignore this email.</p>\n" +
                "            <br>\n" +
                "            <p>Best regards,<br>The StockMAster Team</p>\n" +
                "        </div>\n" +
                "        <div class=\"footer\">\n" +
                "            &copy; 2026 StockMAster Inc. All rights reserved.\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>",
                verifyLink, expiryHours, verifyLink
        );

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
            log.info("Verification email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}. Error: {}", toEmail, e.getMessage());
        }
    }

    public void sendInvoiceEmail(String toEmail, String customerName, String invoiceNo, String invoiceDate, String amountStr, String paymentStatus, byte[] pdfBytes) {
        String subject = "Your StockMAster Invoice #" + invoiceNo;
        String body = String.format(
                "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <title>Invoice from StockMAster</title>\n" +
                "    <style>\n" +
                "        body { font-family: 'Inter', sans-serif; background-color: #f4f5f7; color: #333333; margin: 0; padding: 0; }\n" +
                "        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e1e4e8; }\n" +
                "        .header { background: linear-gradient(135deg, #4f46e5 0%%, #7c3aed 100%%); padding: 30px; text-align: center; color: #ffffff; }\n" +
                "        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }\n" +
                "        .content { padding: 40px 30px; line-height: 1.6; }\n" +
                "        .invoice-details { background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }\n" +
                "        .invoice-details table { width: 100%%; border-collapse: collapse; }\n" +
                "        .invoice-details td { padding: 6px 0; }\n" +
                "        .invoice-details td.label { font-weight: 600; color: #4b5563; }\n" +
                "        .invoice-details td.value { text-align: right; font-weight: 700; color: #1f2937; }\n" +
                "        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; background-color: #f9fafb; border-top: 1px solid #f3f4f6; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"header\">\n" +
                "            <h1>StockMAster Invoice</h1>\n" +
                "        </div>\n" +
                "        <div class=\"content\">\n" +
                "            <p>Hello %s,</p>\n" +
                "            <p>We appreciate your business. Please find attached your invoice <strong>#%s</strong> dated %s.</p>\n" +
                "            <div class=\"invoice-details\">\n" +
                "                <table>\n" +
                "                    <tr>\n" +
                "                        <td class=\"label\">Invoice Number:</td>\n" +
                "                        <td class=\"value\">#%s</td>\n" +
                "                    </tr>\n" +
                "                    <tr>\n" +
                "                        <td class=\"label\">Amount Due:</td>\n" +
                "                        <td class=\"value\">$%s</td>\n" +
                "                    </tr>\n" +
                "                    <tr>\n" +
                "                        <td class=\"label\">Payment Status:</td>\n" +
                "                        <td class=\"value\">%s</td>\n" +
                "                    </tr>\n" +
                "                </table>\n" +
                "            </div>\n" +
                "            <p>A PDF copy of the invoice is attached to this email for your records.</p>\n" +
                "            <p>If you have any questions, feel free to reply directly to this email.</p>\n" +
                "            <br>\n" +
                "            <p>Best regards,<br>The StockMAster Team</p>\n" +
                "        </div>\n" +
                "        <div class=\"footer\">\n" +
                "            &copy; 2026 StockMAster Inc. All rights reserved.\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>",
                customerName, invoiceNo, invoiceDate, invoiceNo, amountStr, paymentStatus
        );

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, true);

            // Add attachment
            org.springframework.core.io.ByteArrayResource byteArrayResource = new org.springframework.core.io.ByteArrayResource(pdfBytes);
            helper.addAttachment("invoice-" + invoiceNo + ".pdf", byteArrayResource);

            mailSender.send(message);
            log.info("Invoice email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send invoice email to {}. Error: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Could not send email. " + e.getMessage());
        }
    }
}
