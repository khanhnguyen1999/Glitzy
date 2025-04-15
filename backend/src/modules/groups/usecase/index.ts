import { IGroupRepository } from '../interface';
import { Group, GroupMember, GroupMemberResponseDTO, GroupMemberRole, GroupMemberUpdateDTO, GroupRequestDTO, GroupResponseDTO, GroupUpdateDTO } from '../model';
import { ErrGroupNotFound, ErrUnauthorizedGroupAction, ErrGroupMemberNotFound, ErrCannotRemoveGroupCreator, ErrCannotChangeCreatorRole } from '../model/error';

export class GroupUseCase {
  constructor(private repository: IGroupRepository) {}

  // Group methods
  async createGroup(data: GroupRequestDTO, userId: string): Promise<Group> {
    return this.repository.create(data, userId);
  }

  async getGroupById(id: string, userId: string): Promise<GroupResponseDTO> {
    const group = await this.repository.findById(id);
    if (!group) {
      throw ErrGroupNotFound;
    }

    const memberCount = await this.repository.countMembers(id);
    const member = await this.repository.findMemberByUserIdAndGroupId(userId, id);
    const isAdmin = member?.role === GroupMemberRole.ADMIN;
    const members = await this.repository.findMembersByGroupId(id);

    return {
      ...group,
      memberCount,
      isAdmin,
      members,
    };
  }

  async updateGroup(id: string, data: GroupUpdateDTO, userId: string): Promise<Group> {
    const group = await this.repository.findById(id);
    if (!group) {
      throw ErrGroupNotFound;
    }

    // Check if user is admin
    const member = await this.repository.findMemberByUserIdAndGroupId(userId, id);
    if (!member || member.role !== GroupMemberRole.ADMIN) {
      throw ErrUnauthorizedGroupAction;
    }

    return this.repository.update(id, data);
  }

  async deleteGroup(id: string, userId: string): Promise<void> {
    const group = await this.repository.findById(id);
    if (!group) {
      throw ErrGroupNotFound;
    }

    // Check if user is admin
    const member = await this.repository.findMemberByUserIdAndGroupId(userId, id);
    if (!member || member.role !== GroupMemberRole.ADMIN) {
      throw ErrUnauthorizedGroupAction;
    }

    await this.repository.delete(id);
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    return this.repository.findByUserId(userId);
  }

  async uploadGroupImage(id: string, imageUrl: string, userId: string): Promise<Group> {
    const group = await this.repository.findById(id);
    if (!group) {
      throw ErrGroupNotFound;
    }

    // Check if user is admin
    const member = await this.repository.findMemberByUserIdAndGroupId(userId, id);
    if (!member || member.role !== GroupMemberRole.ADMIN) {
      throw ErrUnauthorizedGroupAction;
    }

    return this.repository.uploadImage(id, imageUrl);
  }

  // Group member methods
  async addMember(groupId: string, userId: string, addedByUserId: string): Promise<GroupMember> {
    const group = await this.repository.findById(groupId);
    if (!group) {
      throw ErrGroupNotFound;
    }

    // Check if the user adding is an admin
    const adminMember = await this.repository.findMemberByUserIdAndGroupId(addedByUserId, groupId);
    if (!adminMember || adminMember.role !== GroupMemberRole.ADMIN) {
      throw ErrUnauthorizedGroupAction;
    }

    // Check if user is already a member
    const existingMember = await this.repository.findMemberByUserIdAndGroupId(userId, groupId);
    if (existingMember) {
      return existingMember;
    }

    return this.repository.addMember(groupId, userId, GroupMemberRole.MEMBER);
  }

  async removeMember(groupId: string, userId: string, removedByUserId: string): Promise<void> {
    const group = await this.repository.findById(groupId);
    if (!group) {
      throw ErrGroupNotFound;
    }

    // Check if the member exists
    const member = await this.repository.findMemberByUserIdAndGroupId(userId, groupId);
    if (!member) {
      throw ErrGroupMemberNotFound;
    }

    // User can remove themselves, or an admin can remove anyone except the creator
    if (userId === removedByUserId) {
      // User removing themselves
      await this.repository.removeMemberByUserIdAndGroupId(userId, groupId);
      return;
    }

    // Check if the user removing is an admin
    const adminMember = await this.repository.findMemberByUserIdAndGroupId(removedByUserId, groupId);
    if (!adminMember || adminMember.role !== GroupMemberRole.ADMIN) {
      throw ErrUnauthorizedGroupAction;
    }

    // Prevent removing the creator (who should be an admin)
    if (userId === group.creatorId) {
      throw ErrCannotRemoveGroupCreator;
    }

    await this.repository.removeMemberByUserIdAndGroupId(userId, groupId);
  }

  async updateMemberRole(groupId: string, userId: string, data: GroupMemberUpdateDTO, updatedByUserId: string): Promise<GroupMember> {
    const group = await this.repository.findById(groupId);
    if (!group) {
      throw ErrGroupNotFound;
    }

    // Check if the member exists
    const member = await this.repository.findMemberByUserIdAndGroupId(userId, groupId);
    if (!member) {
      throw ErrGroupMemberNotFound;
    }

    // Check if the user updating is an admin
    const adminMember = await this.repository.findMemberByUserIdAndGroupId(updatedByUserId, groupId);
    if (!adminMember || adminMember.role !== GroupMemberRole.ADMIN) {
      throw ErrUnauthorizedGroupAction;
    }

    // Prevent changing the role of the creator
    if (userId === group.creatorId && data.role !== GroupMemberRole.ADMIN) {
      throw ErrCannotChangeCreatorRole;
    }

    return this.repository.updateMember(member.id, data);
  }

  async getGroupMembers(groupId: string, userId: string): Promise<GroupMemberResponseDTO[]> {
    const group = await this.repository.findById(groupId);
    if (!group) {
      throw ErrGroupNotFound;
    }

    // Check if user is a member
    const member = await this.repository.findMemberByUserIdAndGroupId(userId, groupId);
    if (!member) {
      throw ErrUnauthorizedGroupAction;
    }

    return this.repository.findMembersByGroupId(groupId);
  }
}