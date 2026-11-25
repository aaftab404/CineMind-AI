
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


const createAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );
};

const createRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );
};

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        res.cookie("refreshToken", refreshToken, refreshCookieOptions);

        res.status(200).json({
            message: "Login successful!",
            token: accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profileImage: user.profile_image
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({
                message: "Refresh token missing"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET
        );

        const result = await pool.query(
            `SELECT id, name, email, profile_image
             FROM users
             WHERE id = $1`,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        const newAccessToken = createAccessToken(user);

        res.status(200).json({
            token: newAccessToken
        });

    } catch (error) {
        console.error("Refresh token error:", error.message);

        res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
};

export const logoutUser = (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth"
    });

    res.status(200).json({
        message: "Logout successful"
    });
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill in all fields"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [name.trim(), normalizedEmail, hashedPassword]
        );

        res.status(201).json({
            message: "Registration successful!",
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, profileImage } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        const result = await pool.query(
            `UPDATE users
             SET name = $1, profile_image = $2
             WHERE id = $3
             RETURNING id, name, email, profile_image`,
            [name.trim(), profileImage || null, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Profile update error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE email = $1",
            [normalizedEmail]
        );

        // Don't reveal whether an email exists
        if (result.rows.length === 0) {
            return res.status(200).json({
                message: "If an account exists, a password reset link has been sent."
            });
        }

        const user = result.rows[0];

        // Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store only the hashed token in the database
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Token expires in 15 minutes
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        await pool.query(
            `UPDATE users
             SET reset_password_token_hash = $1,
                 reset_password_expires_at = $2
             WHERE id = $3`,
            [hashedToken, expiry, user.id]
        );

        const frontendUrl = (
            process.env.FRONTEND_URL || "http://localhost:5173"
        ).replace(/\/+$/, "");

        const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: `"CineMind" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "CineMind - Password Reset",
            html: `
                <h2>Hello ${user.name},</h2>
                <p>We received a request to reset your CineMind password.</p>
                <p>Click the button below to create a new password:</p>
                <a href="${resetLink}"
                   style="display:inline-block;padding:12px 20px;
                   background:#7c3aed;color:white;text-decoration:none;
                   border-radius:8px;">
                    Reset Password
                </a>
                <p>This link expires in 15 minutes.</p>
                <p>If you didn't request this, you can ignore this email.</p>
            `
        });

        return res.status(200).json({
            message: "If an account exists, a password reset link has been sent."
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            message: "Unable to process password reset request"
        });
    }
};


// Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and new password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        // Hash the token received from the reset link
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find a matching, unexpired reset token
        const result = await pool.query(
            `SELECT id FROM users
             WHERE reset_password_token_hash = $1
             AND reset_password_expires_at > NOW()`,
            [hashedToken]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid or expired password reset link"
            });
        }

        const userId = result.rows[0].id;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and invalidate the reset token
        await pool.query(
            `UPDATE users
             SET password = $1,
                 reset_password_token_hash = NULL,
                 reset_password_expires_at = NULL
             WHERE id = $2`,
            [hashedPassword, userId]
        );

        return res.status(200).json({
            message: "Password reset successful. You can now log in."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Unable to reset password"
        });
    }
};

