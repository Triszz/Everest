import { Router } from "express";
import { emailOtpController } from "./email-otp.controller";

const router = Router();

router.post("/send", emailOtpController.send);
router.post("/resend", emailOtpController.resend);
router.post("/verify", emailOtpController.verify);

export default router;
