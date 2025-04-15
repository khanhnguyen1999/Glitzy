import { Router, Request, Response, NextFunction } from 'express';
import { TravelRecommendationController } from '../../controller/travel-recommendation-controller';
import { ErrUnauthorized } from '@shared/utils/error';
import { TokenIntrospectRPCClient } from '@shared/rpc/verify-token';

export class TravelRecommendationHTTPTransport {
  private introspector: TokenIntrospectRPCClient;
  
  constructor(
    private travelRecommendationController: TravelRecommendationController,
    introspectUrl: string
  ) {
    this.introspector = new TokenIntrospectRPCClient(introspectUrl);
  }

  configureRoutes(router: Router): void {
    // Authentication will be handled in each route handler
    
    // Group-specific recommendations
    router.get(
      '/v1/groups/:groupId/travel-recommendations',
      this.authenticate.bind(this),
      this.travelRecommendationController.getRecommendations.bind(this.travelRecommendationController)
    );
    
    router.post(
      '/v1/groups/:groupId/travel-recommendations',
      this.authenticate.bind(this),
      this.travelRecommendationController.createRecommendation.bind(this.travelRecommendationController)
    );
    
    router.post(
      '/v1/groups/:groupId/travel-recommendations/generate',
      this.authenticate.bind(this),
      this.travelRecommendationController.generateRecommendations.bind(this.travelRecommendationController)
    );
    
    // Individual recommendation routes
    router.get(
      '/v1/travel-recommendations/:id',
      this.authenticate.bind(this),
      this.travelRecommendationController.getRecommendationById.bind(this.travelRecommendationController)
    );
    
    router.put(
      '/v1/travel-recommendations/:id',
      this.authenticate.bind(this),
      this.travelRecommendationController.updateRecommendation.bind(this.travelRecommendationController)
    );
    
    router.put(
      '/v1/travel-recommendations/:id/status',
      this.authenticate.bind(this),
      this.travelRecommendationController.updateRecommendationStatus.bind(this.travelRecommendationController)
    );
    
    router.delete(
      '/v1/travel-recommendations/:id',
      this.authenticate.bind(this),
      this.travelRecommendationController.deleteRecommendation.bind(this.travelRecommendationController)
    );
  }
  
  private async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw ErrUnauthorized.withMessage('Access token is missing');
      }
      
      const { isOk, error } = await this.introspector.introspect(token);
      if (!isOk) {
        throw ErrUnauthorized.withMessage('Invalid access token');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  }
}
