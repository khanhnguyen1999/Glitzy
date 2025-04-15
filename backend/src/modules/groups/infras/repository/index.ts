import { v4 as uuidv4 } from 'uuid';
import prisma from "@shared/components/prisma";

import { IGroupCommandRepository, IGroupMemberCommandRepository, IGroupMemberQueryRepository, IGroupQueryRepository, IGroupRepository } from '../../interface';
import { Group, GroupCondDTO, GroupMember, GroupMemberCondDTO, GroupMemberResponseDTO, GroupMemberRole, GroupMemberUpdateDTO, GroupRequestDTO, GroupStatus, GroupUpdateDTO } from '../../model';

export class PrismaGroupQueryRepository implements IGroupQueryRepository {

  async findById(id: string): Promise<Group | null> {
    const result = await prisma.groups.findUnique({
      where: { id, status: { not: GroupStatus.DELETED } },
    });
    return result as unknown as Group | null;
  }

  async findByCondition(cond: GroupCondDTO): Promise<Group[]> {
    const { id, name, creatorId, status } = cond;
    const results = await prisma.groups.findMany({
      where: {
        id: id ? id : undefined,
        name: name ? { contains: name } : undefined,
        creatorId: creatorId ? creatorId : undefined,
        status: status ? status : { not: GroupStatus.DELETED },
      },
    });
    return results as unknown as Group[];
  }

  async findByUserId(userId: string): Promise<Group[]> {
    const groupMembers = await prisma.groupMembers.findMany({
      where: { userId },
      include: { group: true },
    });

    return groupMembers
      .map((member: any) => member.group)
      .filter((group: any) => group.status !== GroupStatus.DELETED) as unknown as Group[];
  }

  async countMembers(groupId: string): Promise<number> {
    return prisma.groupMembers.count({
      where: { groupId },
    });
  }
}

export class PrismaGroupCommandRepository implements IGroupCommandRepository {

  async create(data: GroupRequestDTO, creatorId: string): Promise<Group> {
    const result = await prisma.groups.create({
      data: {
        id: uuidv4(),
        ...data,
        creatorId,
        status: GroupStatus.ACTIVE,
      },
    });
    return result as unknown as Group;
  }

  async update(id: string, data: GroupUpdateDTO): Promise<Group> {
    const result = await prisma.groups.update({
      where: { id },
      data,
    });
    return result as unknown as Group;
  }

  async delete(id: string): Promise<void> {
    await prisma.groups.update({
      where: { id },
      data: { status: GroupStatus.DELETED },
    });
  }

  async uploadImage(id: string, imageUrl: string): Promise<Group> {
    const result = await prisma.groups.update({
      where: { id },
      data: { image: imageUrl },
    });
    return result as unknown as Group;
  }
}

export class PrismaGroupMemberQueryRepository implements IGroupMemberQueryRepository {
  async findById(id: string): Promise<GroupMember | null> {
    const result = await prisma.groupMembers.findUnique({
      where: { id },
    });
    return result as unknown as GroupMember | null;
  }

  async findByCondition(cond: GroupMemberCondDTO): Promise<GroupMember[]> {
    const { id, groupId, userId, role } = cond;
    const results = await prisma.groupMembers.findMany({
      where: {
        id: id ? id : undefined,
        groupId: groupId ? groupId : undefined,
        userId: userId ? userId : undefined,
        role: role ? role : undefined,
      },
    });
    return results as unknown as GroupMember[];
  }

  async findByGroupId(groupId: string): Promise<GroupMemberResponseDTO[]> {
    // Use a join query instead of include since there's no direct user relation
    const members = await prisma.$queryRaw`
      SELECT
        gm.id, gm.group_id as groupId, gm.user_id as userId,
        gm.role, gm.created_at as createdAt, gm.updated_at as updatedAt,
        u.id as user_id, u.username, u.first_name as firstName,
        u.last_name as lastName, u.avatar
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ${groupId}
    `;

    return (members as any[]).map((member) => ({
      id: member.id,
      groupId: member.groupId,
      userId: member.userId,
      role: member.role,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: {
        id: member.user_id,
        username: member.username,
        firstName: member.firstName,
        lastName: member.lastName,
        avatar: member.avatar,
      },
    }));
  }

  async findByUserIdAndGroupId(userId: string, groupId: string): Promise<GroupMember | null> {
    const result = await prisma.groupMembers.findFirst({
      where: { userId, groupId },
    });
    return result as unknown as GroupMember | null;
  }
}

export class PrismaGroupMemberCommandRepository implements IGroupMemberCommandRepository {
  async create(groupId: string, userId: string, role: GroupMemberRole): Promise<GroupMember> {
    const result = await prisma.groupMembers.create({
      data: {
        id: uuidv4(),
        groupId,
        userId,
        role,
      },
    });
    return result as unknown as GroupMember;
  }

  async update(id: string, data: GroupMemberUpdateDTO): Promise<GroupMember> {
    const result = await prisma.groupMembers.update({
      where: { id },
      data,
    });
    return result as unknown as GroupMember;
  }

  async delete(id: string): Promise<void> {
    await prisma.groupMembers.delete({
      where: { id },
    });
  }

  async deleteByUserIdAndGroupId(userId: string, groupId: string): Promise<void> {
    await prisma.groupMembers.deleteMany({
      where: { userId, groupId },
    });
  }
}

export class PrismaGroupRepository implements IGroupRepository {
  constructor(
    private queryRepo: PrismaGroupQueryRepository,
    private commandRepo: PrismaGroupCommandRepository,
    private memberQueryRepo: PrismaGroupMemberQueryRepository,
    private memberCommandRepo: PrismaGroupMemberCommandRepository,
  ) {}

  // Group methods
  async findById(id: string): Promise<Group | null> {
    return this.queryRepo.findById(id);
  }

  async findByCondition(cond: GroupCondDTO): Promise<Group[]> {
    return this.queryRepo.findByCondition(cond);
  }

  async findByUserId(userId: string): Promise<Group[]> {
    return this.queryRepo.findByUserId(userId);
  }

  async create(data: GroupRequestDTO, creatorId: string): Promise<Group> {
    const { memberIds, ...groupData } = data;
    const group = await this.commandRepo.create(groupData, creatorId);

    // Add creator as admin
    await this.memberCommandRepo.create(group.id, creatorId, GroupMemberRole.ADMIN);

    // Add members if provided
    if (memberIds && memberIds.length > 0) {
      for (const memberId of memberIds) {
        // Skip if the member is the creator (already added as admin)
        if (memberId !== creatorId) {
          await this.memberCommandRepo.create(group.id, memberId, GroupMemberRole.MEMBER);
        }
      }
    }

    return group;
  }

  async update(id: string, data: GroupUpdateDTO): Promise<Group> {
    return this.commandRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.commandRepo.delete(id);
  }

  async uploadImage(id: string, imageUrl: string): Promise<Group> {
    return this.commandRepo.uploadImage(id, imageUrl);
  }

  // Group member methods
  async findMemberById(id: string): Promise<GroupMember | null> {
    return this.memberQueryRepo.findById(id);
  }

  async findMembersByCondition(cond: GroupMemberCondDTO): Promise<GroupMember[]> {
    return this.memberQueryRepo.findByCondition(cond);
  }

  async findMembersByGroupId(groupId: string): Promise<GroupMemberResponseDTO[]> {
    return this.memberQueryRepo.findByGroupId(groupId);
  }

  async findMemberByUserIdAndGroupId(userId: string, groupId: string): Promise<GroupMember | null> {
    return this.memberQueryRepo.findByUserIdAndGroupId(userId, groupId);
  }

  async countMembers(groupId: string): Promise<number> {
    return this.queryRepo.countMembers(groupId);
  }

  async addMember(groupId: string, userId: string, role: GroupMemberRole): Promise<GroupMember> {
    return this.memberCommandRepo.create(groupId, userId, role);
  }

  async updateMember(id: string, data: GroupMemberUpdateDTO): Promise<GroupMember> {
    return this.memberCommandRepo.update(id, data);
  }

  async removeMember(id: string): Promise<void> {
    await this.memberCommandRepo.delete(id);
  }

  async removeMemberByUserIdAndGroupId(userId: string, groupId: string): Promise<void> {
    await this.memberCommandRepo.deleteByUserIdAndGroupId(userId, groupId);
  }
}