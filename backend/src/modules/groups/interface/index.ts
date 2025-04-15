import { Group, GroupCondDTO, GroupMember, GroupMemberCondDTO, GroupMemberResponseDTO, GroupMemberRole, GroupMemberUpdateDTO, GroupRequestDTO, GroupResponseDTO, GroupUpdateDTO } from '../model';

export interface IGroupQueryRepository {
  findById(id: string): Promise<Group | null>;
  findByCondition(cond: GroupCondDTO): Promise<Group[]>;
  findByUserId(userId: string): Promise<Group[]>;
  countMembers(groupId: string): Promise<number>;
}

export interface IGroupCommandRepository {
  create(data: GroupRequestDTO, creatorId: string): Promise<Group>;
  update(id: string, data: GroupUpdateDTO): Promise<Group>;
  delete(id: string): Promise<void>;
  uploadImage(id: string, imageUrl: string): Promise<Group>;
}

export interface IGroupMemberQueryRepository {
  findById(id: string): Promise<GroupMember | null>;
  findByCondition(cond: GroupMemberCondDTO): Promise<GroupMember[]>;
  findByGroupId(groupId: string): Promise<GroupMemberResponseDTO[]>;
  findByUserIdAndGroupId(userId: string, groupId: string): Promise<GroupMember | null>;
}

export interface IGroupMemberCommandRepository {
  create(groupId: string, userId: string, role: GroupMemberRole): Promise<GroupMember>;
  update(id: string, data: GroupMemberUpdateDTO): Promise<GroupMember>;
  delete(id: string): Promise<void>;
  deleteByUserIdAndGroupId(userId: string, groupId: string): Promise<void>;
}

export interface IGroupRepository {
  findById(id: string): Promise<Group | null>;
  findByCondition(cond: GroupCondDTO): Promise<Group[]>;
  findByUserId(userId: string): Promise<Group[]>;
  create(data: GroupRequestDTO, creatorId: string): Promise<Group>;
  update(id: string, data: GroupUpdateDTO): Promise<Group>;
  delete(id: string): Promise<void>;
  uploadImage(id: string, imageUrl: string): Promise<Group>;
  
  // Group members
  findMemberById(id: string): Promise<GroupMember | null>;
  findMembersByCondition(cond: GroupMemberCondDTO): Promise<GroupMember[]>;
  findMembersByGroupId(groupId: string): Promise<GroupMemberResponseDTO[]>;
  findMemberByUserIdAndGroupId(userId: string, groupId: string): Promise<GroupMember | null>;
  countMembers(groupId: string): Promise<number>;
  addMember(groupId: string, userId: string, role: GroupMemberRole): Promise<GroupMember>;
  updateMember(id: string, data: GroupMemberUpdateDTO): Promise<GroupMember>;
  removeMember(id: string): Promise<void>;
  removeMemberByUserIdAndGroupId(userId: string, groupId: string): Promise<void>;
}