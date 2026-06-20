-- Phase 4: Study Sessions
CREATE TABLE IF NOT EXISTS study_sessions (
    id                     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id                BIGINT      NOT NULL,
    group_id               BIGINT,
    session_type           VARCHAR(20) NOT NULL,
    session_status         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    planned_study_seconds  INT,
    planned_break_seconds  INT,
    started_at             TIMESTAMP   NOT NULL DEFAULT NOW(),
    ended_at               TIMESTAMP,
    actual_seconds_studied INT         NOT NULL DEFAULT 0,
    created_at             TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_session_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_session_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
    CONSTRAINT chk_session_type   CHECK (session_type   IN ('POMODORO','CUSTOM','STOPWATCH')),
    CONSTRAINT chk_session_status CHECK (session_status IN ('ACTIVE','COMPLETED','ABANDONED'))
);
