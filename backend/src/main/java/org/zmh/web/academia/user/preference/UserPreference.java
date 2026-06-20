package org.zmh.web.academia.user.preference;

import jakarta.persistence.*;
import lombok.*;
import org.zmh.web.academia.user.User;

@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private int pomodoroStudyMinutes = 25;

    @Column(nullable = false)
    @Builder.Default
    private int pomodoroBreakMinutes = 5;
}
