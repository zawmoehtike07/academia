package org.zmh.web.academia.group;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zmh.web.academia.exception.BadRequestException;
import org.zmh.web.academia.exception.ForbiddenException;
import org.zmh.web.academia.exception.ResourceNotFoundException;
import org.zmh.web.academia.group.GroupDto.*;
import org.zmh.web.academia.user.User;
import org.zmh.web.academia.user.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public GroupResponse createGroup(Long userId, CreateGroupRequest req) {
        User owner = findUser(userId);
        Group group = Group.builder()
                .name(req.name())
                .description(req.description())
                .owner(owner)
                .build();
        group = groupRepository.save(group);

        // Owner is automatically a member
        GroupMember member = GroupMember.builder()
                .group(group)
                .user(owner)
                .build();
        groupMemberRepository.save(member);

        return toGroupResponse(group);
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups(Long userId) {
        return groupRepository.findGroupsByMemberId(userId).stream()
                .map(this::toGroupResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroup(Long groupId, Long userId) {
        Group group = findGroup(groupId);
        requireMember(groupId, userId);
        return toGroupResponse(group);
    }

    @Transactional
    public GroupResponse updateGroup(Long groupId, Long userId, UpdateGroupRequest req) {
        Group group = findGroup(groupId);
        requireOwner(group, userId);

        if (req.name() != null) group.setName(req.name());
        if (req.description() != null) group.setDescription(req.description());
        return toGroupResponse(groupRepository.save(group));
    }

    @Transactional
    public void deleteGroup(Long groupId, Long userId) {
        Group group = findGroup(groupId);
        requireOwner(group, userId);
        groupRepository.delete(group);
    }

    @Transactional
    public void joinGroup(Long groupId, Long userId) {
        Group group = findGroup(groupId);
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new BadRequestException("You are already a member of this group");
        }
        User user = findUser(userId);
        GroupMember member = GroupMember.builder().group(group).user(user).build();
        groupMemberRepository.save(member);
    }

    @Transactional
    public void addMember(Long groupId, Long requesterId, String username) {
        Group group = findGroup(groupId);
        requireOwner(group, requesterId);
        User userToAdd = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userToAdd.getId())) {
            throw new BadRequestException("User is already a member of this group");
        }
        GroupMember member = GroupMember.builder().group(group).user(userToAdd).build();
        groupMemberRepository.save(member);
    }

    @Transactional
    public void leaveGroup(Long groupId, Long userId) {
        Group group = findGroup(groupId);
        if (group.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Owner cannot leave the group. Transfer ownership or delete the group.");
        }
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new BadRequestException("You are not a member of this group"));
        groupMemberRepository.delete(member);
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getMembers(Long groupId, Long userId) {
        requireMember(groupId, userId);
        Group group = findGroup(groupId);
        return groupMemberRepository.findByGroupId(groupId).stream()
                .map(gm -> new MemberResponse(
                        gm.getUser().getId(),
                        gm.getUser().getUsername(),
                        gm.getUser().getEmail(),
                        gm.getJoinedAt().toString(),
                        gm.getUser().getId().equals(group.getOwner().getId())
                ))
                .toList();
    }

    // ---- helpers ----

    private Group findGroup(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    private void requireOwner(Group group, Long userId) {
        if (!group.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Only the group owner can perform this action");
        }
    }

    private void requireMember(Long groupId, Long userId) {
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new ForbiddenException("You are not a member of this group");
        }
    }

    private GroupResponse toGroupResponse(Group group) {
        long memberCount = groupMemberRepository.countByGroupId(group.getId());
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getOwner().getId(),
                group.getOwner().getUsername(),
                group.getCreatedAt().toString(),
                memberCount
        );
    }
}
