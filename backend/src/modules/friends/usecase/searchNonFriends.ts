import { IFriendQueryRepository } from '@modules/friends/interface';
import { FriendResponseDTO, FriendSearchDTO, friendSearchDTOSchema } from '@modules/friends/model';
import { Requester } from '@shared/interface';
import { Paginated, PagingDTO } from '@shared/model';

/**
 * Search for users who are not already friends with the requester
 * This is useful for finding new people to add as friends
 */
export async function searchNonFriends(
  repository: IFriendQueryRepository,
  requester: Requester,
  searchData: FriendSearchDTO,
  paging: PagingDTO
): Promise<Paginated<FriendResponseDTO>> {
  const dto = friendSearchDTOSchema.parse(searchData);
  return await repository.searchNonFriendsByNameOrEmail(requester.sub, dto, paging);
}
