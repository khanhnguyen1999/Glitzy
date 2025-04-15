import prisma from "@shared/components/prisma";
import { v4 as uuidv4 } from 'uuid';
import { TravelRecommendation, TravelRecommendationRequestDTO, TravelRecommendationUpdateDTO } from '../model';

export interface TravelRecommendationQueryRepository {
  findById(id: string): Promise<TravelRecommendation | null>;
  findByGroupId(groupId: string): Promise<TravelRecommendation[]>;
}

export interface TravelRecommendationCommandRepository {
  create(groupId: string, dto: TravelRecommendationRequestDTO): Promise<TravelRecommendation>;
  update(id: string, dto: TravelRecommendationUpdateDTO): Promise<TravelRecommendation>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: string): Promise<TravelRecommendation>;
}

export class PrismaTravelRecommendationRepository implements TravelRecommendationQueryRepository, TravelRecommendationCommandRepository {
  constructor() {}

  async findById(id: string): Promise<TravelRecommendation | null> {
    // Using raw query since there might be issues with the Prisma client types
    const result = await prisma.$queryRaw`
      SELECT * FROM travel_recommendations WHERE id = ${id} LIMIT 1
    `;
    return (result as any[])[0] as unknown as TravelRecommendation | null;
  }

  async findByGroupId(groupId: string): Promise<TravelRecommendation[]> {
    // Using raw query since there might be issues with the Prisma client types
    const result = await prisma.$queryRaw`
      SELECT * FROM travel_recommendations WHERE group_id = ${groupId}
    `;
    return result as unknown as TravelRecommendation[];
  }

  async create(groupId: string, dto: TravelRecommendationRequestDTO): Promise<TravelRecommendation> {
    const id = uuidv4();
    
    // Using raw queries as a fallback since there might be issues with the Prisma client types
    await prisma.$executeRaw`
      INSERT INTO travel_recommendations 
      (id, group_id, name, description, address, image_url, status) 
      VALUES (
        ${id}, 
        ${groupId}, 
        ${dto.name}, 
        ${dto.description || null}, 
        ${dto.address || null}, 
        ${dto.imageUrl || null}, 
        'todo'
      )
    `;
    
    return this.findById(id) as Promise<TravelRecommendation>;
  }

  async update(id: string, dto: TravelRecommendationUpdateDTO): Promise<TravelRecommendation> {
    const updates = [];
    const values: any[] = [];
    
    if (dto.name !== undefined) {
      updates.push('name = ?');
      values.push(dto.name);
    }
    
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description);
    }
    
    if (dto.address !== undefined) {
      updates.push('address = ?');
      values.push(dto.address);
    }
    
    if (dto.imageUrl !== undefined) {
      updates.push('image_url = ?');
      values.push(dto.imageUrl);
    }
    
    if (dto.status !== undefined) {
      updates.push('status = ?');
      values.push(dto.status);
    }
    
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    
    // Add the id as the last parameter
    values.push(id);
    
    // Using raw query since there might be issues with the Prisma client types
    if (updates.length > 0) {
      // Convert to a format that works with Prisma's raw queries
      const updateQuery = `UPDATE travel_recommendations SET ${updates.join(', ')} WHERE id = ?`;
      await prisma.$executeRawUnsafe(updateQuery, ...values);
    }
    
    return this.findById(id) as Promise<TravelRecommendation>;
  }

  async updateStatus(id: string, status: string): Promise<TravelRecommendation> {
    // Using raw query since there might be issues with the Prisma client types
    await prisma.$executeRaw`
      UPDATE travel_recommendations 
      SET status = ${status}, updated_at = ${new Date().toISOString()} 
      WHERE id = ${id}
    `;
    
    return this.findById(id) as Promise<TravelRecommendation>;
  }

  async delete(id: string): Promise<void> {
    // Using raw query since there might be issues with the Prisma client types
    await prisma.$executeRaw`
      DELETE FROM travel_recommendations WHERE id = ${id}
    `;
  }
}
