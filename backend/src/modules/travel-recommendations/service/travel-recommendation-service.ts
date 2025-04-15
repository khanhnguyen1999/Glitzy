import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { TravelRecommendation, TravelRecommendationRequestDTO, TravelRecommendationUpdateDTO } from '../model';
import { TravelRecommendationCommandRepository, TravelRecommendationQueryRepository } from '../repository/travel-recommendation-repository';

export class TravelRecommendationService {
  private genAI: GoogleGenerativeAI;
  private API_KEY = 'AIzaSyAnfQQeJe4KP9yxTx6t5eKPdIyNwUb6Cmk';

  constructor(
    private travelRecommendationQueryRepository: TravelRecommendationQueryRepository,
    private travelRecommendationCommandRepository: TravelRecommendationCommandRepository
  ) {
    this.genAI = new GoogleGenerativeAI(this.API_KEY);
  }

  async getRecommendationsByGroupId(groupId: string): Promise<TravelRecommendation[]> {
    return this.travelRecommendationQueryRepository.findByGroupId(groupId);
  }

  async getRecommendationById(id: string): Promise<TravelRecommendation | null> {
    return this.travelRecommendationQueryRepository.findById(id);
  }

  async createRecommendation(groupId: string, dto: TravelRecommendationRequestDTO): Promise<TravelRecommendation> {
    return this.travelRecommendationCommandRepository.create(groupId, dto);
  }

  async updateRecommendation(id: string, dto: TravelRecommendationUpdateDTO): Promise<TravelRecommendation> {
    return this.travelRecommendationCommandRepository.update(id, dto);
  }

  async updateRecommendationStatus(id: string, status: string): Promise<TravelRecommendation> {
    return this.travelRecommendationCommandRepository.updateStatus(id, status);
  }

  async deleteRecommendation(id: string): Promise<void> {
    return this.travelRecommendationCommandRepository.delete(id);
  }

  async generateRecommendations(groupId: string, location: string): Promise<TravelRecommendation[]> {
    try {
      console.log('Using Gemini API for', location);
      
      // Configure the model
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      },{apiVersion: 'v1beta',});
      
      // Generate travel recommendations using Gemini
      const prompt = `You are a helpful travel assistant that provides recommendations for places to visit. Generate 5 must-visit places in ${location}. For each place, provide a name, brief description, and address. Format the response as a JSON array with objects containing 'name', 'description', and 'address' fields.`;
      
      console.log('Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      console.log('Gemini response received');
      
      const response = await result.response;
      let content = response.text();
      
      if (!content) {
        throw new Error('Failed to generate recommendations');
      }

      // Clean up the content - remove markdown code blocks if present
      content = content.replace(/```json\n/g, '').replace(/```/g, '').trim();
      
      let recommendations;
      try {
        // Parse the JSON response
        recommendations = JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        
        // Try to extract JSON from the text using regex as a fallback
        const jsonMatch = content.match(/\[\s*{.*}\s*\]/s);
        if (jsonMatch) {
          const jsonContent = jsonMatch[0];
          recommendations = JSON.parse(jsonContent);
        } else {
          throw new Error('Failed to parse recommendations from Gemini response');
        }
      }
      
      // Create recommendations in the database
      const createdRecommendations: TravelRecommendation[] = [];
      
      for (const rec of recommendations) {
        // Ensure all required fields are present
        if (!rec.name || !rec.description) {
          console.warn('Skipping recommendation with missing required fields:', rec);
          continue;
        }
        
        const dto: TravelRecommendationRequestDTO = {
          name: rec.name,
          description: rec.description,
          address: rec.address || 'Address not available'
        };
        
        const created = await this.travelRecommendationCommandRepository.create(groupId, dto);
        createdRecommendations.push(created);
      }
      
      return createdRecommendations;
    } catch (error) {
      console.error('Error generating travel recommendations:', error);
      throw new Error('Failed to generate travel recommendations');
    }
  }
}
