package org.zmh.web.academia.group;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class GroupDto {

    public record CreateGroupRequest(
            @NotBlank @Size(min = 2, max = 100) String name,
            @Size(max = 500) String description
    ) {}

    public record UpdateGroupRequest(
            @Size(min = 2, max = 100) String name,
            @Size(max = 500) String description
    ) {}

    public record AddMemberRequest(
            @NotBlank String username
    ) {}

    public record GroupResponse(
            Long id,
            String name,
            String description,
            Long ownerId,
            String ownerUsername,
            String createdAt,
            long memberCount
    ) {}

    public record MemberResponse(
            Long userId,
            String username,
            String email,
            String joinedAt,
            boolean isOwner
    ) {}
}
