CREATE DATABASE IF NOT EXISTS ucu_lost_and_found
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ucu_lost_and_found;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS item_returns;
DROP TABLE IF EXISTS claim_decisions;
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS item_reports;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  student_or_staff_id VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_id_number (student_or_staff_id),
  KEY idx_users_role_active (role, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE item_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reporter_id BIGINT UNSIGNED NOT NULL,
  report_type ENUM('LOST', 'FOUND') NOT NULL,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  private_identifying_info TEXT NULL,
  location_text VARCHAR(140) NOT NULL,
  incident_date DATE NOT NULL,
  image_path VARCHAR(255) NULL,
  status ENUM('OPEN', 'CLAIM_PENDING', 'CLAIMED', 'RETURNED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_reporter (reporter_id),
  KEY idx_reports_type_status (report_type, status),
  KEY idx_reports_category_date (category, incident_date),
  KEY idx_reports_location (location_text),
  KEY idx_reports_created_at (created_at),
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id)
    REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE claims (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id BIGINT UNSIGNED NOT NULL,
  claimant_id BIGINT UNSIGNED NOT NULL,
  ownership_explanation TEXT NOT NULL,
  private_evidence_details TEXT NOT NULL,
  evidence_file_path VARCHAR(255) NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_claims_report_status (report_id, status),
  KEY idx_claims_claimant_status (claimant_id, status),
  KEY idx_claims_created_at (created_at),
  CONSTRAINT fk_claims_report FOREIGN KEY (report_id)
    REFERENCES item_reports (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_claims_claimant FOREIGN KEY (claimant_id)
    REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE claim_decisions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  claim_id BIGINT UNSIGNED NOT NULL,
  decided_by_admin_id BIGINT UNSIGNED NOT NULL,
  decision ENUM('APPROVED', 'REJECTED') NOT NULL,
  decision_reason TEXT NOT NULL,
  decided_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_claim_decisions_claim (claim_id),
  KEY idx_claim_decisions_admin (decided_by_admin_id),
  CONSTRAINT fk_decisions_claim FOREIGN KEY (claim_id)
    REFERENCES claims (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_decisions_admin FOREIGN KEY (decided_by_admin_id)
    REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE item_returns (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id BIGINT UNSIGNED NOT NULL,
  claim_id BIGINT UNSIGNED NOT NULL,
  confirmed_by_admin_id BIGINT UNSIGNED NOT NULL,
  collector_name VARCHAR(120) NOT NULL,
  collector_id_number VARCHAR(50) NOT NULL,
  verification_notes TEXT NULL,
  returned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_returns_report (report_id),
  UNIQUE KEY uq_returns_claim (claim_id),
  KEY idx_returns_admin (confirmed_by_admin_id),
  CONSTRAINT fk_returns_report FOREIGN KEY (report_id)
    REFERENCES item_reports (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_returns_claim FOREIGN KEY (claim_id)
    REFERENCES claims (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_returns_admin FOREIGN KEY (confirmed_by_admin_id)
    REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(140) NOT NULL,
  message VARCHAR(500) NOT NULL,
  related_type ENUM('REPORT', 'CLAIM', 'RETURN', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
  related_id BIGINT UNSIGNED NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_read (user_id, is_read, created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE activity_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  details_json JSON NULL,
  ip_address VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_activity_actor (actor_id, created_at),
  KEY idx_activity_entity (entity_type, entity_id),
  CONSTRAINT fk_activity_actor FOREIGN KEY (actor_id)
    REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
