export const ErrGroupNotFound = new Error('Group not found');
export const ErrUnauthorizedGroupAction = new Error('You are not authorized to perform this action');
export const ErrGroupMemberNotFound = new Error('Group member not found');
export const ErrUserAlreadyInGroup = new Error('User is already a member of this group');
export const ErrCannotRemoveGroupCreator = new Error('Cannot remove the group creator');
export const ErrInvalidGroupRole = new Error('Invalid group role');
export const ErrCannotChangeCreatorRole = new Error('Cannot change the role of the group creator');
export const ErrInvalidUserId = new Error('Invalid user ID');