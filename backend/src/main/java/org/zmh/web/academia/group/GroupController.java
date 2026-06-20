package org.zmh.web.academia.group;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zmh.web.academia.group.GroupDto.*;
import org.zmh.web.academia.security.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<GroupResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateGroupRequest req) {
        return ResponseEntity.ok(groupService.createGroup(principal.getId(), req));
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getMyGroups(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(groupService.getMyGroups(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupResponse> getGroup(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroup(id, principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupResponse> updateGroup(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateGroupRequest req) {
        return ResponseEntity.ok(groupService.updateGroup(id, principal.getId(), req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        groupService.deleteGroup(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> join(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        groupService.joinGroup(id, principal.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leave(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        groupService.leaveGroup(id, principal.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Void> addMember(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AddMemberRequest req) {
        groupService.addMember(id, principal.getId(), req.username());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<MemberResponse>> getMembers(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(groupService.getMembers(id, principal.getId()));
    }
}
