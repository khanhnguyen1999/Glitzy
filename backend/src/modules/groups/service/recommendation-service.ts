import { v4 as uuidv4 } from 'uuid';
import { TravelRecommendationStatus } from '../../groups/model';
import axios from 'axios';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export interface TravelRecommendation {
  id: string;
  name: string;
  description: string;
  address?: string;
  date?: string | null;
  status: TravelRecommendationStatus;
}

export interface LocationSearchResult {
  place_id: string;
  osm_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    country?: string;
    state?: string;
  };
  type?: string;
  importance?: number;
}

export class RecommendationService {
  private GOOGLE_API_KEY = process.env.GEMINI_API_KEY!;
  private LOCATION_IQ_API_KEY = process.env.LOCATION_IQ_API_KEY!;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(this.GOOGLE_API_KEY);
  }

  /**
   * Search for locations using LocationIQ API
   * @param query Search query string
   * @param limit Maximum number of results to return (default: 5)
   * @returns Array of location search results
   */
  /**
   * Validates and fixes image URLs to ensure they work
   * @param imageUrl The image URL from the AI
   * @param location Location name for fallback
   * @param tripType Trip type for fallback
   * @returns A valid image URL
   */
  private generateReliableImageUrl(imageUrl: string, location: string, tripType: string): string {
    // Default fallback images if everything else fails
    const fallbackImages = [
      'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg',
      'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg',
      'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg',
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg',
      'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg'
    ];
    
    // If no image URL provided, return a random fallback
    if (!imageUrl) {
      return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    }
    
    // Check if it's a valid Pexels URL with the expected format
    const pexelsPattern = /https:\/\/images\.pexels\.com\/photos\/\d{6,7}\/pexels-photo-\d{6,7}\.(jpeg|jpg|png)/i;
    
    if (pexelsPattern.test(imageUrl)) {
      return imageUrl; // It's a valid Pexels URL, use it
    }
    
    // If it's another URL that looks like an image URL, try to use it
    if (imageUrl.match(/\.(jpeg|jpg|png|webp)$/i) && 
        (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      return imageUrl;
    }
    
    // If we get here, the URL is not valid, return a fallback
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }

  async searchLocations(query: string, limit: number = 5): Promise<LocationSearchResult[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://api.locationiq.com/v1/autocomplete?key=${this.LOCATION_IQ_API_KEY}&q=${encodedQuery}&limit=${limit}&dedupe=1&format=json`;
      
      const response = await axios.get(url);
      
      if (response.status !== 200) {
        throw new Error(`LocationIQ API error: ${response.statusText}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error searching locations:', error);
      throw new Error('Failed to search locations');
    }
  }

  async generateRecommendations(location: string, tripType: string = 'General'): Promise<TravelRecommendation[]> {
    try {
      console.log('Using Google Generative AI for', location);
      
      // Generate travel recommendations using Google Generative AI
      const prompt = `You are a helpful travel assistant that provides recommendations for places to visit. Generate 5 must-visit places in ${location} for a trip focused on "${tripType}". For each place, provide:
      - name: A descriptive name
      - description: A brief engaging description (2-3 sentences)
      - address: A realistic address
      - imageUrl: A valid image URL from Pexels (e.g., https://images.pexels.com/photos/xxxxx/pexels-photo-xxxxx.jpeg) where xxxxx is a 6-7 digit number. IMPORTANT: Only use Pexels URLs with this exact format.
      - rating: A rating between 1-5 (can include decimal)
      - votes: A number between 50-500 representing how many people rated this place
      
      Make sure the recommendations align well with the "${tripType}" theme. Format the response as a JSON array with objects containing all the fields mentioned above.`;
      
      console.log('Sending request to Google Generative AI...');
      
      // Get the model
      const model = this.genAI.getGenerativeModel({
        // model: "gemini-1.5-pro-latest",
        model: "gemini-2.0-flash",
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
      
      // Generate content
      const result = await model.generateContent(prompt);
      
      console.log('Google AI response received');
      
      // Get the text from the response
      let messageContent = result.response.text() || '';
      
      if (!messageContent) {
        throw new Error('Failed to generate recommendations');
      }

      // Clean up the content - remove markdown code blocks if present
      messageContent = messageContent.replace(/```json\n/g, '').replace(/```/g, '').trim();
      let parsedRecommendations: any;
      try {
        // Parse the JSON response
        parsedRecommendations = JSON.parse(messageContent);
        console.log('parsedRecommendations ', parsedRecommendations);
        
        // If the response is an object with a recommendations array, extract it
        if (parsedRecommendations.recommendations) {
          parsedRecommendations = parsedRecommendations.recommendations;
        }
        
        // Ensure the result is an array
        if (!Array.isArray(parsedRecommendations)) {
          // If it's not an array but has some property that is an array, use that
          const arrayProps = Object.keys(parsedRecommendations).find(key => 
            Array.isArray(parsedRecommendations[key]) && parsedRecommendations[key].length > 0
          );
          
          if (arrayProps) {
            parsedRecommendations = parsedRecommendations[arrayProps];
          } else {
            // If we can't find an array, wrap the object in an array
            parsedRecommendations = [parsedRecommendations];
          }
        }
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('Failed to parse recommendations from DeepSeek response');
      }
            
      // Transform the parsed recommendations to include all required fields
      const recommendations = parsedRecommendations.map((rec: any) => ({
        id: uuidv4(),
        name: rec.name || rec.place_name || rec.title || 'Unnamed Location',
        description: rec.description || rec.details || rec.summary || '',
        address: rec.address || rec.location || '',
        imageUrl: this.generateReliableImageUrl(rec.imageUrl, location, tripType),
        rating: rec.rating || parseFloat((Math.random() * 2 + 3).toFixed(1)), // Random rating between 3.0-5.0
        votes: rec.votes || rec.num_reviews || Math.floor(Math.random() * 450) + 50, // Random votes between 50-500
        status: TravelRecommendationStatus.TODO
      }));
      
      console.log('Processed recommendations:', recommendations);
      return recommendations;
    } catch (error) {
      console.error('Error generating travel recommendations:', error);
      throw new Error(`Failed to generate travel recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
