package org.zmh.web.academia.group;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByOwnerId(Long ownerId);

    @Query("SELECT g FROM Group g JOIN GroupMember gm ON gm.group = g WHERE gm.user.id = :userId")
    List<Group> findGroupsByMemberId(@Param("userId") Long userId);
}
