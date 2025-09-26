import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken, generateReferralCode } from '../utils/auth';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, phone_number, referral_code } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Start transaction for referral system
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const hashedPassword = await hashPassword(password);
      const referralCode = generateReferralCode();
      
      const user = await tx.user.create({
        data: {
          email,
          password_hash: hashedPassword,
          full_name,
          phone_number,
          referral_code: referralCode,
          role: 'customer'
        }
      });

      let referrer = null;
      let userCoupon = null;

      // Handle referral code
      if (referral_code) {
        referrer = await tx.user.findUnique({ 
          where: { referral_code: referral_code } 
        });

        if (referrer) {
          // Create referral record
          await tx.referral.create({
            data: {
              referrer_id: referrer.id,
              referee_id: user.id,
              code_used: referral_code
            }
          });

          // Add points to referrer (expire in 3 months)
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 3);

          await tx.userPoint.create({
            data: {
              user_id: referrer.id,
              amount: 10000,
              source_type: 'referral',
              expiry_date: expiryDate
            }
          });

          // Create discount coupon for new user (expire in 3 months)
          const couponTemplate = await tx.couponTemplate.findFirst();
          if (couponTemplate) {
            const couponExpiry = new Date();
            couponExpiry.setMonth(couponExpiry.getMonth() + 3);

            userCoupon = await tx.userCoupon.create({
              data: {
                user_id: user.id,
                coupon_template_id: couponTemplate.id,
                code: `WELCOME${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                expiry_date: couponExpiry
              }
            });
          }
        }
      }

      return { user, referrer, userCoupon };
    });

    // Generate token
    const token = generateToken(result.user.id);

    res.status(201).json({
      user: {
        id: result.user.id,
        email: result.user.email,
        full_name: result.user.full_name,
        role: result.user.role,
        referral_code: result.user.referral_code
      },
      token,
      message: result.referrer ? 'Registration successful with referral bonus' : 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        referral_code: user.referral_code
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone_number: true,
        profile_picture: true,
        role: true,
        referral_code: true,
        created_at: true
      }
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { full_name, phone_number, profile_picture } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        full_name,
        phone_number,
        profile_picture
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone_number: true,
        profile_picture: true,
        role: true,
        referral_code: true
      }
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isCurrentPasswordValid = await comparePassword(current_password, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await hashPassword(new_password);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password_hash: hashedNewPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};