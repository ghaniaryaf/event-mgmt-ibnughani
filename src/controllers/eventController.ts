import { Response } from 'express';
import { AuthRequest, EventFilterParams } from '../types';
import { EventService } from '../services/eventService';
import { handleValidationErrors } from '../middleware/validation';

const eventService = new EventService();

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    handleValidationErrors(req, res, () => {});

    const filters: EventFilterParams = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
      category: req.query.category as string,
      location: req.query.location as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    };

    const result = await eventService.getEvents(filters);

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: result.events,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    handleValidationErrors(req, res, () => {});

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { ticketTypes, ...eventData } = req.body;
    const result = await eventService.createEvent(req.user.id, eventData, ticketTypes);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    handleValidationErrors(req, res, () => {});

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params;
    const event = await eventService.updateEvent(id, req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrganizerEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await eventService.getOrganizerEvents(req.user.id, page, limit);

    res.status(200).json({
      success: true,
      message: 'Organizer events retrieved successfully',
      data: result.events,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEventAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params;
    const analytics = await eventService.getEventAnalytics(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Event analytics retrieved successfully',
      data: analytics,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};