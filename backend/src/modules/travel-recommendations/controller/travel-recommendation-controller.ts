import { Request, Response } from 'express';
import { TravelRecommendationRequestDTO, TravelRecommendationUpdateDTO, travelRecommendationRequestDTOSchema, travelRecommendationUpdateDTOSchema } from '../model';
import { TravelRecommendationService } from '../service/travel-recommendation-service';

export class TravelRecommendationController {
  constructor(
    private travelRecommendationService: TravelRecommendationService
  ) {}

  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const recommendations = await this.travelRecommendationService.getRecommendationsByGroupId(groupId);
      res.status(200).json(recommendations);
    } catch (error) {
      console.error('Error fetching travel recommendations:', error);
      res.status(500).json({ message: 'Failed to fetch travel recommendations' });
    }
  }

  async getRecommendationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const recommendation = await this.travelRecommendationService.getRecommendationById(id);
      
      if (!recommendation) {
        res.status(404).json({ message: 'Travel recommendation not found' });
        return;
      }
      
      res.status(200).json(recommendation);
    } catch (error) {
      console.error('Error fetching travel recommendation:', error);
      res.status(500).json({ message: 'Failed to fetch travel recommendation' });
    }
  }

  async createRecommendation(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const dto = req.body as TravelRecommendationRequestDTO;
      
      // Validate the request body
      const validationResult = travelRecommendationRequestDTOSchema.safeParse(dto);
      if (!validationResult.success) {
        res.status(400).json({ 
          message: 'Invalid request data', 
          errors: validationResult.error.errors 
        });
        return;
      }
      
      const recommendation = await this.travelRecommendationService.createRecommendation(groupId, dto);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error('Error creating travel recommendation:', error);
      res.status(500).json({ message: 'Failed to create travel recommendation' });
    }
  }

  async updateRecommendation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body as TravelRecommendationUpdateDTO;
      
      // Validate the request body
      const validationResult = travelRecommendationUpdateDTOSchema.safeParse(dto);
      if (!validationResult.success) {
        res.status(400).json({ 
          message: 'Invalid request data', 
          errors: validationResult.error.errors 
        });
        return;
      }
      
      const recommendation = await this.travelRecommendationService.updateRecommendation(id, dto);
      res.status(200).json(recommendation);
    } catch (error) {
      console.error('Error updating travel recommendation:', error);
      res.status(500).json({ message: 'Failed to update travel recommendation' });
    }
  }

  async updateRecommendationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['todo', 'completed', 'rejected'].includes(status)) {
        res.status(400).json({ message: 'Invalid status value' });
        return;
      }
      
      const recommendation = await this.travelRecommendationService.updateRecommendationStatus(id, status);
      res.status(200).json(recommendation);
    } catch (error) {
      console.error('Error updating travel recommendation status:', error);
      res.status(500).json({ message: 'Failed to update travel recommendation status' });
    }
  }

  async deleteRecommendation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.travelRecommendationService.deleteRecommendation(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting travel recommendation:', error);
      res.status(500).json({ message: 'Failed to delete travel recommendation' });
    }
  }

  async generateRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const { location } = req.body;
      
      if (!location) {
        res.status(400).json({ message: 'Location is required' });
        return;
      }
      
      const recommendations = await this.travelRecommendationService.generateRecommendations(groupId, location);
      res.status(201).json(recommendations);
    } catch (error) {
      console.error('Error generating travel recommendations:', error);
      res.status(500).json({ message: 'Failed to generate travel recommendations' });
    }
  }
}
