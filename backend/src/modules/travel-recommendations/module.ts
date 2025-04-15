import { Router } from 'express';
import { PrismaTravelRecommendationRepository } from './repository/travel-recommendation-repository';
import { TravelRecommendationService } from './service/travel-recommendation-service';
import { TravelRecommendationController } from './controller/travel-recommendation-controller';
import { TravelRecommendationHTTPTransport } from './infras/transport';
import { config } from '@shared/components/config';

export function initializeTravelRecommendationModule(router: Router): void {
  // Initialize repositories
  const travelRecommendationRepository = new PrismaTravelRecommendationRepository();
  
  // Initialize service with repositories
  const travelRecommendationService = new TravelRecommendationService(
    travelRecommendationRepository,
    travelRecommendationRepository
  );
  
  // Initialize controller with service
  const travelRecommendationController = new TravelRecommendationController(
    travelRecommendationService
  );
  
  // Initialize HTTP transport with controller and configure routes
  const travelRecommendationHTTPTransport = new TravelRecommendationHTTPTransport(
    travelRecommendationController,
    config.rpc.introspectUrl
  );
  
  travelRecommendationHTTPTransport.configureRoutes(router);
}
