-- Phase 3: Real-Time Chat Messages
CREATE TABLE IF NOT EXISTS messages (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_id     BIGINT        NOT NULL,
    sender_id    BIGINT,
    content      VARCHAR(65535) NOT NULL,
    message_type VARCHAR(20)   NOT NULL DEFAULT 'USER_MESSAGE',
    edited       BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_message_group  FOREIGN KEY (group_id)  REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id)  ON DELETE SET NULL,
    CONSTRAINT chk_message_type  CHECK (message_type IN ('USER_MESSAGE','AI_MESSAGE','SYSTEM_MESSAGE'))
);
