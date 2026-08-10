import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  workspaceName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, workspaceName } = signupSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const workspace = await prisma.workspace.create({
      data: { name: workspaceName }
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        workspaceId: workspace.id,
        role: 'ADMIN'
      }
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, email: user.email, role: user.role, workspaceId: user.workspaceId } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        role: true,
        workspaceId: true,
        workspace: { select: { id: true, name: true } },
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']),
});

export const getWorkspaceUsers = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const users = await prisma.user.findMany({
      where: { workspaceId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspace users' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const { email, password, role } = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        workspaceId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        workspaceId: true,
        createdAt: true,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
};

const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']),
});

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const { id } = req.params;
    const { role } = updateRoleSchema.parse(req.body);

    const targetUser = await prisma.user.findFirst({
      where: { id, workspaceId },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found in workspace' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
};

