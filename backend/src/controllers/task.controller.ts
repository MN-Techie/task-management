import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { TaskStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.PENDING),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(TaskStatus).optional(),
  search: z.string().optional(),
});

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, status, search } = querySchema.parse(req.query);
    const userId = req.user!.userId;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status && { status }),
      ...(search && {
        title: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = createTaskSchema.parse(req.body);
    const userId = req.user!.userId;

    const task = await prisma.task.create({
      data: { ...data, userId },
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const data = updateTaskSchema.parse(req.body);

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError('Task not found', 404);
    }

    const task = await prisma.task.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError('Task not found', 404);
    }

    await prisma.task.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError('Task not found', 404);
    }

    const nextStatus: Record<TaskStatus, TaskStatus> = {
      PENDING: TaskStatus.IN_PROGRESS,
      IN_PROGRESS: TaskStatus.COMPLETED,
      COMPLETED: TaskStatus.PENDING,
    };

    const task = await prisma.task.update({
      where: { id },
      data: { status: nextStatus[existing.status] },
    });

    res.json({
      success: true,
      message: 'Task status updated',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};