-- Realistic Fictional Sample Data for UCU BBUC Campus Lost and Found
USE ucu_lost_and_found;

INSERT INTO users (id, full_name, email, student_or_staff_id, phone, password_hash, role, is_active) VALUES
(1, 'Tumusiime David', 'tumusiime@ucu.ac.ug', 'UCU-BBUC-ADM-04', '+256701884210', '$2a$10$qWDuIUnmsXohWhPRU0TtUe6RATrR6FOw/ZlkdnTeTPn0wSiT/ysEC', 'ADMIN', 1),
(2, 'Natukunda Grace', 'grace@students.ucu.ac.ug', 'S23B13/0118', '+256772410892', '$2a$10$qWDuIUnmsXohWhPRU0TtUe6RATrR6FOw/ZlkdnTeTPn0wSiT/ysEC', 'STUDENT', 1),
(3, 'Mugisha Brian', 'brian@students.ucu.ac.ug', 'S23B13/0419', '+256784119503', '$2a$10$qWDuIUnmsXohWhPRU0TtUe6RATrR6FOw/ZlkdnTeTPn0wSiT/ysEC', 'STUDENT', 1),
(4, 'Ainembabazi Peace', 'peace@students.ucu.ac.ug', 'S24B23/0074', '+256752903411', '$2a$10$qWDuIUnmsXohWhPRU0TtUe6RATrR6FOw/ZlkdnTeTPn0wSiT/ysEC', 'STUDENT', 1);

INSERT INTO item_reports (id, reporter_id, report_type, title, category, description, private_identifying_info, location_text, incident_date, image_path, status) VALUES
(101, 2, 'FOUND', 'HP EliteBook 840 G5 Laptop Charger (65W)', 'Electronics & Laptops', 'Black HP 65W blue-tip laptop charger found plugged into socket row B near the silent reading carrels.', 'Small green electrical tape wrap near AC brick and serial suffix 984K.', 'L7', '2026-11-18', NULL, 'CLAIM_PENDING'),
(102, 3, 'FOUND', 'UCU Student Identity Card & Library Card', 'Student IDs & Documents', 'Found inside a transparent lanyard holder outside the ICT lab entrance after afternoon lectures.', 'Belongs to a BIT Year 2 student; card number ends in /0419.', 'ICT Computer LabLab', '2026-11-19', NULL, 'OPEN'),
(103, 2, 'LOST', 'Navy Blue Laptop Bag', 'Bags & Backpacks', 'Medium navy backpack containing a spiral notebook, scientific calculator, and USB flash drive.', 'Casio fx-991ES Plus inside front pocket with initials G.N. on back cover.', 'Old Chapel', '2026-11-17', NULL, 'OPEN'),
(104, 4, 'FOUND', 'Bunch of 3 Keys on Red UCU Keyholder', 'Keys & Access Cards', 'Three brass Yale keys attached to a red woven UCU lanyard ring picked up near the canteen tables.', 'One brass key has a stamped room tag reading RM-14.', 'Staff Lounge', '2026-11-15', NULL, 'CLAIMED'),
(105, 3, 'FOUND', 'Samsung Galaxy A15 Smartphone (Blue-Black)', 'Electronics & Laptops', 'Android smartphone in a clear silicone case handed in at the Main Gate security desk.', 'Lock screen wallpaper shows Rwenzori mountain ridge; dual SIM.', 'Library', '2026-11-10', NULL, 'RETURNED'),
(106, 4, 'LOST', 'Introduction to Database Systems Textbook (6th Ed.)', 'Books & Stationery', 'Hardcover database systems textbook left on the second-row desk in Bishop Stuart Hall.', 'Sticky notes in Chapter 7 (Normalization) and owner signature on page 3.', 'Multipurpose Hall', '2026-11-20', NULL, 'OPEN');

INSERT INTO claims (id, report_id, claimant_id, ownership_explanation, private_evidence_details, evidence_file_path, status) VALUES
(501, 101, 3, 'I left my HP charger plugged in at Carrel B4 before heading to my 10 AM lecture.', 'The cord has green electrical tape near the brick and serial ending 984K.', NULL, 'PENDING'),
(502, 104, 2, 'Dropped my hostel and padlock keys after lunch at the canteen.', 'One brass key has tag RM-14 stamped on the bow.', NULL, 'APPROVED'),
(503, 105, 2, 'Lost my Samsung A15 near the main gate boda stage.', 'Rwenzori mountain wallpaper and verified IMEI at security desk.', NULL, 'APPROVED');

INSERT INTO claim_decisions (id, claim_id, decided_by_admin_id, decision, decision_reason) VALUES
(701, 502, 1, 'APPROVED', 'Verified room tag RM-14 and student residency record.'),
(702, 503, 1, 'APPROVED', 'Verified IMEI and device unlock with claimant.');

INSERT INTO item_returns (id, report_id, claim_id, confirmed_by_admin_id, collector_name, collector_id_number, verification_notes) VALUES
(901, 105, 503, 1, 'Natukunda Grace', 'S23B13/0118', 'Inspected physical UCU Student ID card and signed handover register.');

INSERT INTO notifications (user_id, title, message, related_type, related_id, is_read) VALUES
(2, 'Claim Approved', 'Your ownership claim (#502) for Bunch of 3 Yale Keys on Red UCU Keyholder was approved.', 'CLAIM', 502, 0),
(2, 'Item Returned', 'Physical collection confirmed for Samsung Galaxy A15 Smartphone (Blue-Black).', 'RETURN', 105, 1),
(3, 'Claim Under Review', 'Your ownership claim (#501) for HP EliteBook 840 G5 Laptop Charger (65W) is pending review.', 'CLAIM', 501, 0);

INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, details_json, ip_address) VALUES
(1, 'CONFIRM_RETURN', 'item_returns', 901, JSON_OBJECT('report_id', 105, 'claim_id', 503, 'collector_id', 'S23B13/0118'), '127.0.0.1'),
(1, 'APPROVE_CLAIM', 'claims', 502, JSON_OBJECT('report_id', 104, 'claimant_id', 2), '127.0.0.1'),
(3, 'SUBMIT_CLAIM', 'claims', 501, JSON_OBJECT('report_id', 101), '127.0.0.1');
